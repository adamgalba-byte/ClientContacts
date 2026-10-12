
using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ContactsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult> GetContacts(
      string? search = null,
      string sortBy = "lastName",
      string sortDirection = "asc",
      int page = 1,
      int pageSize = 10)
    {
        if (page < 1)
        {
            page = 1;
        }

        if (pageSize < 1)
        {
            pageSize = 10;
        }

        if (pageSize > 100)
        {
            pageSize = 100;
        }

        var query = _context.Contacts
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim();

            query = query.Where(c =>
                c.FirstName.Contains(search) ||
                c.LastName.Contains(search) ||
                c.Email.Contains(search) ||
                c.PhoneNumber.Contains(search));
        }

        query = sortBy.ToLower() switch
        {
            "firstname" => sortDirection.ToLower() == "desc"
                ? query.OrderByDescending(c => c.FirstName)
                : query.OrderBy(c => c.FirstName),

            "email" => sortDirection.ToLower() == "desc"
                ? query.OrderByDescending(c => c.Email)
                : query.OrderBy(c => c.Email),

            "phonenumber" => sortDirection.ToLower() == "desc"
                ? query.OrderByDescending(c => c.PhoneNumber)
                : query.OrderBy(c => c.PhoneNumber),

            _ => sortDirection.ToLower() == "desc"
                ? query.OrderByDescending(c => c.LastName)
                : query.OrderBy(c => c.LastName)
        };

        var allContactsCount = await _context.Contacts.CountAsync();

        var totalCount = await query.CountAsync();

        var contacts = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new
        {
            items = contacts,
            totalCount,
            allContactsCount,
            page,
            pageSize
        });
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Contact>> GetContact(int id)
    {
        var contact = await _context.Contacts.FindAsync(id);

        if (contact == null)
        {
            return NotFound();
        }

        return Ok(contact);
    }

    [HttpPost]
    public async Task<ActionResult<Contact>> CreateContact(Contact contact)
    {
        _context.Contacts.Add(contact);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetContact),
            new { id = contact.Id },
            contact);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateContact(
        int id,
        Contact updatedContact)
    {
        if (id != updatedContact.Id)
        {
            return BadRequest("The ID in the URL must match the contact ID.");
        }

        var contact = await _context.Contacts.FindAsync(id);

        if (contact == null)
        {
            return NotFound();
        }

        contact.FirstName = updatedContact.FirstName;
        contact.LastName = updatedContact.LastName;
        contact.Email = updatedContact.Email;
        contact.PhoneNumber = updatedContact.PhoneNumber;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteContact(int id)
    {
        var contact = await _context.Contacts.FindAsync(id);

        if (contact == null)
        {
            return NotFound();
        }

        _context.Contacts.Remove(contact);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}