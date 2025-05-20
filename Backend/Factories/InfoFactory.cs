using Project.Backend.DTOs;
using Project.Backend.Models;

namespace Project.Backend.Factories
{
    public static class InfoFactory
    {
        public static InfoModel CreateInfo(UserCreateDto userDto, int roleId)
        {
            return roleId switch
            {
                4 => new InfoModel // Читатель
                {
                    Fio = userDto.Fio,
                    Phone = userDto.Phone,
                    TicketNumber = userDto.TicketNumber,
                    Birthday = userDto.Birthday,
                    Education = userDto.Education,
                    HallId = userDto.HallId
                },
                2 or 3 => new InfoModel // Админ или Библиотекарь
                {
                    Fio = userDto.Fio,
                    Phone = userDto.Phone
                },
                _ => throw new ArgumentException("Invalid role ID")
            };
        }
    }
}