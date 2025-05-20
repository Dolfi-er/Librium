using Microsoft.EntityFrameworkCore;
using Project.Backend.Models;

namespace Project.Backend.Data
{
    public class AppDBContext : DbContext
    {
        public AppDBContext(DbContextOptions<AppDBContext> options) : base(options) { }

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
            modelBuilder.Entity<TransmissionModel>()
                .HasKey(t => new { t.BookId, t.UserId });

            modelBuilder.Entity<WrittenByModel>()
                .HasKey(w => new { w.BookId, w.AuthorId });

            modelBuilder.Entity<UserModel>()
                .HasOne(u => u.Info)
                .WithOne(i => i.User)
                .HasForeignKey<InfoModel>(i => i.Id); // Shared primary key

            modelBuilder.Entity<UserModel>()
                .HasOne(u => u.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(u => u.RoleId);

            modelBuilder.Entity<InfoModel>()
                .HasOne(i => i.Hall)
                .WithMany(h => h.Infos)
                .HasForeignKey(i => i.HallId);

            modelBuilder.Entity<TransmissionModel>()
                .HasOne(t => t.Status)
                .WithMany(s => s.Transmissions)
                .HasForeignKey(t => t.StatusId);

            modelBuilder.Entity<WrittenByModel>()
                .HasOne(w => w.Book)
                .WithMany(b => b.WrittenBys)
                .HasForeignKey(w => w.BookId);

            modelBuilder.Entity<WrittenByModel>()
                .HasOne(w => w.Author)
                .WithMany(a => a.WrittenBys)
                .HasForeignKey(w => w.AuthorId);

            modelBuilder.Entity<TransmissionModel>()
                .HasOne(t => t.Book)
                .WithMany(b => b.Transmissions)
                .HasForeignKey(t => t.BookId);

            modelBuilder.Entity<TransmissionModel>()
                .HasOne(t => t.User)
                .WithMany()
                .HasForeignKey(t => t.UserId);
        }
    }
}