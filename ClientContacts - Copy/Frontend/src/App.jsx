
import { useEffect, useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:5106/api/contacts';

const emptyForm = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
};

function App() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [allContactsCount, setAllContactsCount] = useState(0);
    const [sortBy, setSortBy] = useState('lastName');
    const [sortDirection, setSortDirection] = useState('asc');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    async function loadContacts() {
        try {
            setError('');

            const params = new URLSearchParams({
                search,
                sortBy,
                sortDirection,
                page,
                pageSize,
            });

            const response = await fetch(`${API_URL}?${params}`);

            if (!response.ok) {
                throw new Error('Could not load contacts.');
            }

            const data = await response.json();

            setContacts(data.items);
            setTotalCount(data.totalCount);
            setAllContactsCount(data.allContactsCount);
        } catch {
            setError('Could not connect to the server. Check that the backend is running.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadContacts();
    }, [search, sortBy, sortDirection, page]);

   
    function openAddForm() {
        setEditingId(null);
        setForm({ ...emptyForm });
        setError('');
        setIsFormOpen(true);
    }

    function openEditForm(contact) {
        setEditingId(contact.id);
        setForm({
            firstName: contact.firstName,
            lastName: contact.lastName,
            email: contact.email,
            phoneNumber: contact.phoneNumber,
        });
        setError('');
        setIsFormOpen(true);
    }

    function closeForm() {
        setIsFormOpen(false);
        setEditingId(null);
        setForm({ ...emptyForm });
    }

    function handleInputChange(event) {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSaving(true);
        setError('');

        const isEditing = editingId !== null;
        const url = isEditing ? `${API_URL}/${editingId}` : API_URL;

        const payload = isEditing
            ? { id: editingId, ...form }
            : form;

        try {
            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const details = await response.text();
                throw new Error(details || 'Could not save the contact.');
            }

            closeForm();
            await loadContacts();
        } catch (err) {
            setError(err.message || 'Something went wrong while saving.');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(contact) {
        const confirmed = window.confirm(
            `Delete ${contact.firstName} ${contact.lastName}? This cannot be undone.`
        );


        if (!confirmed) return;

        try {
            setError('');
            const response = await fetch(`${API_URL}/${contact.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Could not delete the contact.');
            }

            await loadContacts();
        } catch (err) {
            setError(err.message || 'Something went wrong while deleting.');
        }
    }

    function handleSort(column) {
        if (sortBy === column) {
            setSortDirection((current) =>
                current === 'asc' ? 'desc' : 'asc'
            );
        } else {
            setSortBy(column);
            setSortDirection('asc');
        }

        setPage(1);
    }

    return (
        <main className="app">
            <header className="page-header">
                <div>
                    <p className="eyebrow">CLIENT RELATIONSHIPS</p>
                    <h1>Your contacts<span className="title-dot">.</span></h1>
                    <p className="subtitle">
                        Keep every important connection close at hand.
                    </p>
                </div>

                <button className="primary-button" onClick={openAddForm}>
                    <span aria-hidden="true">＋</span> Add contact
                </button>
            </header>

            <section className="stats-grid">
                <article className="stat-card">
                    <span className="stat-label">TOTAL CONTACTS</span>
                    <strong className="stat-number">{allContactsCount}</strong>
                    <span className="stat-note">In your directory</span>
                </article>

                <article className="stat-card accent-card">
                    <span className="stat-label">SEARCH RESULTS</span>
                    <strong className="stat-number">{totalCount}</strong>
                    <span className="stat-note">Matching your search</span>
                </article>
            </section>

            <section className="contacts-panel">
                <div className="panel-header">
                    <div>
                        <h2>Contact directory</h2>
                        <p>Manage the people you work with.</p>
                    </div>

                    <label className="search-box">
                        <span aria-hidden="true">⌕</span>
                        <input
                            type="search"
                            placeholder="Search contacts..."
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setPage(1);
                            }}
                            aria-label="Search contacts"
                        />
                    </label>
                </div>

                {error && <p className="error-message">{error}</p>}

                {loading ? (
                    <p className="empty-state">Loading your contacts...</p>
                ) : (
                    <div className="table-wrapper">
                        <table>

                                <thead>
                                    <tr>
                                        <th>
                                            <button
                                                type="button"
                                                className="sortable-header"
                                                onClick={() => handleSort('lastName')}
                                            >
                                                Contact {sortBy === 'lastName'
                                                    ? (sortDirection === 'asc' ? '↑' : '↓')
                                                    : '↕'}
                                            </button>
                                        </th>

                                        <th>
                                            <button
                                                type="button"
                                                className="sortable-header"
                                                onClick={() => handleSort('email')}
                                            >
                                                Email address {sortBy === 'email'
                                                    ? (sortDirection === 'asc' ? '↑' : '↓')
                                                    : '↕'}
                                            </button>
                                        </th>

                                        <th>
                                            <button
                                                type="button"
                                                className="sortable-header"
                                                onClick={() => handleSort('phoneNumber')}
                                            >
                                                Phone number {sortBy === 'phoneNumber'
                                                    ? (sortDirection === 'asc' ? '↑' : '↓')
                                                    : '↕'}
                                            </button>
                                        </th>

                                        <th>Actions</th>
                                    </tr>
                                </thead>

                            <tbody>
                                    {contacts.map((contact) => (
                                    <tr key={contact.id}>
                                        <td>
                                            <div className="person-cell">
                                                <span className="avatar">
                                                    {contact.firstName.charAt(0).toUpperCase()}
                                                    {contact.lastName.charAt(0).toUpperCase()}
                                                </span>
                                                <span className="contact-name">
                                                    {contact.firstName} {contact.lastName}
                                                </span>
                                            </div>
                                        </td>
                                        <td>{contact.email}</td>
                                        <td>{contact.phoneNumber}</td>
                                        <td>
                                            <div className="row-actions">
                                                <button
                                                    className="text-button"
                                                    onClick={() => openEditForm(contact)}
                                                    aria-label={`Edit ${contact.firstName} ${contact.lastName}`}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="text-button delete-button"
                                                    onClick={() => handleDelete(contact)}
                                                    aria-label={`Delete ${contact.firstName} ${contact.lastName}`}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                            {totalCount === 0 && (
                            <div className="empty-state">
                                <div className="empty-icon">◎</div>
                                <h3>{search ? 'No matching contacts' : 'Your directory is empty'}</h3>
                                <p>
                                    {search
                                        ? 'Try another name, email address, or phone number.'
                                        : 'Add your first contact to get started.'}
                                </p>
                                {!search && (
                                    <button className="primary-button" onClick={openAddForm}>
                                        Add your first contact
                                    </button>
                                )}
                            </div>
                            )}
                            {totalCount > 0 && (
                                <div className="pagination">
                                    <span style={{ marginLeft: "10px" }}>
                                        Showing {(page - 1) * pageSize + 1}–
                                        {Math.min(page * pageSize, totalCount)} of {totalCount}
                                    </span>

                                    <div className="pagination-buttons">
                                        <button
                                            className="secondary-button"
                                            onClick={() => setPage((current) => current - 1)}
                                            disabled={page === 1}
                                        >
                                            Previous
                                        </button>

                                        <span>
                                            Page {page} of {Math.max(1, Math.ceil(totalCount / pageSize))}
                                        </span>

                                        <button
                                            className="secondary-button"
                                            onClick={() => setPage((current) => current + 1)}
                                            disabled={page >= Math.ceil(totalCount / pageSize)}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                    </div>
                )}
            </section>

            <footer className="page-footer">
                <span>CONTACTS / DIRECTORY</span>
                <span>Built for better connections</span>
            </footer>

            {isFormOpen && (
                <div
                    className="modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) closeForm();
                    }}
                >
                    <section
                        className="contact-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="form-title"
                    >
                        <div className="modal-header">
                            <div>
                                <p className="eyebrow">{editingId !== null ? 'EDIT DETAILS' : 'NEW CONNECTION'}</p>
                                <h2 id="form-title">
                                    {editingId !== null ? 'Edit contact' : 'Add a contact'}
                                </h2>
                            </div>
                            <button className="close-button" onClick={closeForm} aria-label="Close form">
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <label>
                                    First name
                                    <input
                                        name="firstName"
                                        value={form.firstName}
                                        onChange={handleInputChange}
                                        required
                                        maxLength={100}
                                        autoFocus
                                        placeholder="e.g. Alex"
                                    />
                                </label>

                                <label>
                                    Last name
                                    <input
                                        name="lastName"
                                        value={form.lastName}
                                        onChange={handleInputChange}
                                        required
                                        maxLength={100}
                                        placeholder="e.g. Morgan"
                                    />
                                </label>

                                <label className="full-width">
                                    Email address
                                    <input
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleInputChange}
                                        required
                                        maxLength={254}
                                        placeholder="alex@example.com"
                                    />
                                </label>

                                <label className="full-width">
                                    Phone number
                                    <input
                                        name="phoneNumber"
                                        type="tel"
                                        value={form.phoneNumber}
                                        onChange={handleInputChange}
                                        required
                                        minLength={7}
                                        maxLength={30}
                                        pattern="(?=.*\d)[0-9+() .-]{7,30}"
                                        title="Use 7–30 characters: digits, spaces, +, parentheses, dots or hyphens."
                                        placeholder="+421 900 123 456"
                                    />
                                </label>
                            </div>

                            {error && <p className="error-message">{error}</p>}

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={closeForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button className="primary-button" type="submit" disabled={saving}>
                                    {saving ? 'Saving...' : editingId !== null ? 'Save changes' : 'Create contact'}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </main>
    );
}

export default App;