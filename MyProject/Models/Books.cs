using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MyProject.Models
{
    public class Book
    {
        public Guid Id { get; set; }  // PostgreSQL'de GUID kullanmak için

        public string BookName { get; set; } = null!;


        public string Category { get; set; } = null!;

        public string Author { get; set; } = null!;

        // Kitapla ilgili yorumları alabiliriz
        public List<Comment> Comments { get; set; } = new List<Comment>();
    }
}

