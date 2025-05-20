using Microsoft.EntityFrameworkCore;
using Project.Backend.Models;

namespace Project.Backend.Data
{
    public class AppDBContext : DbContext
    {
        public AppDBContext(DbContextOptions<AppDBContext> options) : base(options) { }

        // Все DbSet-модели
        public DbSet<UserModel> Users { get; set; }
        public DbSet<BookModel> Books { get; set; }
        public DbSet<AuthorModel> Authors { get; set; }
        public DbSet<TransmissionModel> Transmissions { get; set; }
        public DbSet<StatusModel> Statuses { get; set; }
        public DbSet<WrittenByModel> WrittenBys { get; set; }
        public DbSet<RoleModel> Roles { get; set; }
        public DbSet<InfoModel> Infos { get; set; }
        public DbSet<HallModel> Halls { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Составной ключ для TransmissionModel
            modelBuilder.Entity<TransmissionModel>()
                .HasKey(t => new { t.BookId, t.UserId });

            // Составной ключ для WrittenByModel
            modelBuilder.Entity<WrittenByModel>()
                .HasKey(w => new { w.BookId, w.AuthorId });

            // Один-к-одному: UserModel -> InfoModel
            modelBuilder.Entity<UserModel>()
                .HasOne(u => u.Info)
                .WithOne(i => i.User)
                .HasForeignKey<InfoModel>(i => i.Id) // Общий первичный ключ
                .OnDelete(DeleteBehavior.Cascade);

            // Многие-к-одному: UserModel -> RoleModel
            modelBuilder.Entity<UserModel>()
                .HasOne(u => u.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(u => u.RoleId);

            // Многие-к-одному: InfoModel -> HallModel
            modelBuilder.Entity<InfoModel>()
                .HasOne(i => i.Hall)
                .WithMany(h => h.Infos)
                .HasForeignKey(i => i.HallId);

            // Каскадное удаление для Book -> WrittenBy
            modelBuilder.Entity<BookModel>()
                .HasMany(b => b.WrittenBys)
                .WithOne(w => w.Book)
                .OnDelete(DeleteBehavior.Cascade);

            // Остальные связи
            modelBuilder.Entity<TransmissionModel>()
                .HasOne(t => t.Status)
                .WithMany(s => s.Transmissions)
                .HasForeignKey(t => t.StatusId);

            modelBuilder.Entity<WrittenByModel>()
                .HasOne(w => w.Author)
                .WithMany(a => a.WrittenBys)
                .HasForeignKey(w => w.AuthorId);

            modelBuilder.Entity<TransmissionModel>()
                .HasOne(t => t.User)
                .WithMany()
                .HasForeignKey(t => t.UserId);
        }
    }
}