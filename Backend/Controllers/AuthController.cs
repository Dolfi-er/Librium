using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Project.Backend.Data;
using Project.Backend.Models;

namespace Project.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDBContext _context;
        private readonly IConfiguration _config;

        public AuthController(AppDBContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Login == loginDto.Login);

            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.HashedPassword))
            {
                return Unauthorized(new { message = "Неверный логин или пароль" });
            }

            var token = GenerateJwtToken(user);
            
            // Настраиваем куки для работы между разными доменами
            Response.Cookies.Append("access_token", token, new CookieOptions
            {
                HttpOnly = false, // Изменено на false, чтобы JavaScript мог читать куки
                Secure = true,
                SameSite = SameSiteMode.None, // Разрешаем куки для кросс-доменных запросов
                Expires = DateTime.UtcNow.AddHours(6),
                Path = "/" // Доступно для всех путей
            });

            // Возвращаем токен и в теле ответа для дополнительной надежности
            return Ok(new { 
                Token = token, 
                Role = user.Role?.Name 
            });
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // Удаляем куки при выходе
            Response.Cookies.Delete("access_token", new CookieOptions
            {
                HttpOnly = false,
                Secure = true,
                SameSite = SameSiteMode.None,
                Path = "/"
            });

            return Ok(new { message = "Выход выполнен успешно" });
        }

        private string GenerateJwtToken(UserModel user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Login),
                new Claim(ClaimTypes.Role, user.Role?.Name ?? "User")
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Key"]));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(6),
                SigningCredentials = creds,
                Issuer = _config["Jwt:Issuer"],
                Audience = _config["Jwt:Audience"]
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public class LoginDto
        {
            [Required] public string Login { get; set; } = null!;
            [Required] public string Password { get; set; } = null!;
        }
    }
}