
using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class Contact
{
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(254)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(30)]
    [RegularExpression(
        @"^(?=.*\d)[0-9+() .-]{7,30}$",
        ErrorMessage = "Enter a valid phone number using digits and standard phone-number characters.")]
    public string PhoneNumber { get; set; } = string.Empty;
}