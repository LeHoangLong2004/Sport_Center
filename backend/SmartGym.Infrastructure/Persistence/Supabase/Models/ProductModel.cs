using Postgrest.Attributes;
using Postgrest.Models;

namespace SmartGym.Infrastructure.Persistence.Supabase.Models;

[Table("products")]
public class ProductModel : BaseModel
{
    [PrimaryKey("id", false)]
    public Guid Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = "";

    [Column("category")]
    public string Category { get; set; } = "";

    [Column("price")]
    public decimal Price { get; set; }

    [Column("stock_quantity")]
    public int StockQuantity { get; set; }

    [Column("image_url")]
    public string ImageUrl { get; set; } = "";

    [Column("status")]
    public bool Status { get; set; }
}
