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
            // Составные ключи
            modelBuilder.Entity<TransmissionModel>()
                .HasKey(t => new { t.BookId, t.UserId });

            modelBuilder.Entity<WrittenByModel>()
                .HasKey(w => new { w.BookId, w.AuthorId });

            // Исправленная конфигурация для UserModel и InfoModel
            modelBuilder.Entity<UserModel>()
                .HasOne(u => u.Info)
                .WithOne(i => i.User)
                .HasForeignKey<UserModel>(u => u.InfoId) // Внешний ключ в UserModel
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserModel>()
                .HasOne(u => u.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(u => u.RoleId);

            // Связи для InfoModel
            modelBuilder.Entity<InfoModel>()
                .HasOne(i => i.Hall)
                .WithMany(h => h.Infos)
                .HasForeignKey(i => i.HallId);

            // Каскадные удаления для BookModel
            modelBuilder.Entity<BookModel>()
                .HasMany(b => b.WrittenBys)
                .WithOne(w => w.Book)
                .OnDelete(DeleteBehavior.Cascade);

            // Каскадные удаления для AuthorModel -> WrittenByModel
            modelBuilder.Entity<WrittenByModel>()
                .HasOne(w => w.Author)
                .WithMany(a => a.WrittenBys)
                .HasForeignKey(w => w.AuthorId)
                .OnDelete(DeleteBehavior.Cascade);

            // Связи для TransmissionModel
            modelBuilder.Entity<TransmissionModel>()
                .HasOne(t => t.Status)
                .WithMany(s => s.Transmissions)
                .HasForeignKey(t => t.StatusId);

            // Каскадные удаления для User -> Transmission
            modelBuilder.Entity<TransmissionModel>()
                .HasOne(t => t.User)
                .WithMany()
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Каскадные удаления для Book -> Transmission
            modelBuilder.Entity<TransmissionModel>()
                .HasOne(t => t.Book)
                .WithMany(b => b.Transmissions)
                .HasForeignKey(t => t.BookId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}