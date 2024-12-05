using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MyProject.Models
{
    public class Comment
    {
        public Guid Id { get; set; }  // PostgreSQL'de GUID kullanmak için

        public string Text { get; set; } = null!;

        public Guid UserId { get; set; }  // Yorumun sahibi olan kullanıcının ID'si

        public Guid BookId { get; set; }  // Kitap ID'si
        public string IsApproved { get; set; } = "Pending";

        // İlişkiler
        public User? User { get; set; } = null!;
        public Book? Book { get; set; } = null!;
    }
}

