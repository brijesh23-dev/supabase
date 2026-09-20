import { useEffect, useState } from "react";
import { supabase } from "./supabase-client";

export default function Crud() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    username: "",
    salary: "",
    profession: "",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    username: "",
    salary: "",
    profession: "",
  });
  const [updating, setUpdating] = useState(false);

  const handleform = async (e) => {
    setForm({
      username: "",
      salary: "",
      profession: "",
    });
    e.preventDefault();

    const { data, error } = await supabase
      .from("users")
      .insert({
        username: form.username,
        salary: Number(form.salary),
        profession: form.profession,
      })
      .select();

    if (error) {
      console.log("INSERT ERROR:", error);
      return;
    }

    console.log("INSERTED:", data);
    console.log(form);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleDeleteUser = async (id) => {
    const { data: userDeleted, error } = await supabase
      .from("users")
      .delete()
      .eq("id", id);
    if (error) {
      console.log("delete user error:", error);
      return;
    }
    console.log(userDeleted);
  };

  const openUpdateForm = (user) => {
    setEditingUser(user);
    setEditForm({
      username: user.username || "",
      salary: user.salary || "",
      profession: user.profession || "",
    });
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setUpdating(true);

    const updatedUser = {
      username: editForm.username,
      salary: Number(editForm.salary),
      profession: editForm.profession,
    };
    const { data, error: updateError } = await supabase
      .from("users")
      .update(updatedUser)
      .eq("id", editingUser.id)
      .select()
      .single();

    if (updateError) {
      console.log("UPDATE ERROR:", updateError);
      setUpdating(false);
      return;
    }

    setUsers((currentUsers) =>
      currentUsers.map((user) => (user.id === editingUser.id ? data : user)),
    );
    setEditingUser(null);
    setUpdating(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: fetchUser, error: fetchError } = await supabase
        .from("users")
        .select("*");

      if (fetchError) {
        setError("Could not load users. Please try again.");
      } else {
        setUsers(fetchUser || []);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <main className="users-page">
      <section className="users-container">
        <header className="users-header">
          <div>
            <p className="section-kicker">Team directory</p>
            <h1>People who make things happen.</h1>
            <p className="section-description">
              A simple view of the people, professions, and salaries in your
              workspace.
            </p>
          </div>
          <div className="user-count">
            <strong>{users.length}</strong>
            <span>
              people
              <br />
              listed
            </span>
          </div>
        </header>

        <section className="add-user-card" aria-labelledby="add-user-title">
          <div className="add-user-heading">
            <p className="section-kicker">New entry</p>
            <h2 id="add-user-title">Add a person</h2>
            <p>Capture the essentials and add them to your directory.</p>
          </div>
          {/* form */}
          <form className="add-user-form" onSubmit={handleform}>
            <label>
              Username
              <input
                name="username"
                type="text"
                placeholder="e.g. brijesh"
                value={form.username}
                onChange={handleChange}
              />
            </label>
            <label>
              Profession
              <input
                name="profession"
                type="text"
                placeholder="e.g. web-developer"
                value={form.profession}
                onChange={handleChange}
              />
            </label>
            <label>
              Salary
              <input
                name="salary"
                type="number"
                min="0"
                placeholder="e.g. 30000"
                value={form.salary}
                onChange={handleChange}
              />
            </label>
            <button type="submit">
              Add person <span aria-hidden="true">↗</span>
            </button>
          </form>
        </section>

        <div className="users-table" role="table" aria-label="Users">
          <div className="users-table-header" role="row">
            <span>Username</span>
            <span>Profession</span>
            <span>Annual salary</span>
            <span>Actions</span>
          </div>

          {loading && <p className="users-message">Loading users...</p>}
          {!loading && error && (
            <p className="users-message error-message">{error}</p>
          )}
          {!loading && !error && users.length === 0 && (
            <p className="users-message">No users found.</p>
          )}
          {!loading &&
            !error &&
            users.map((user, index) => (
              <div
                className="user-row  "
                role="row"
                key={user.id || `${user.username}-${index}`}
              >
                <div className="user-identity" role="cell">
                  <span className={`user-avatar avatar-${index % 4}`}>
                    {user.username?.slice(0, 2).toUpperCase()}
                  </span>
                  <span>{user.username}</span>
                </div>
                <span role="cell" className="profession-cell">
                  {user.profession}
                </span>
                <span role="cell" className="salary-cell">
                  {Number(user.salary).toLocaleString("en-US")}
                </span>
                <span role="cell" className="actions-cell">
                  <button
                    className="update-button"
                    type="button"
                    aria-label={`Update ${user.username}`}
                    onClick={() => openUpdateForm(user)}
                  >
                    Update
                  </button>
                  <button
                    className="delete-button"
                    type="button"
                    aria-label={`Delete ${user.username}`}
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Delete
                  </button>
                </span>
              </div>
            ))}
        </div>
      </section>
      {editingUser && (
        <div
          className="edit-modal-backdrop"
          role="presentation"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setEditingUser(null)
          }
        >
          <section
            className="edit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-user-title"
          >
            <button
              className="close-modal"
              type="button"
              aria-label="Close update form"
              onClick={() => setEditingUser(null)}
            >
              ×
            </button>
            <p className="section-kicker">Edit profile</p>
            <h2 id="edit-user-title">Update {editingUser.username}</h2>
            <p className="edit-modal-description">
              Change the details below and save your updates.
            </p>
            <form className="edit-user-form" onSubmit={handleUpdateUser}>
              <label>
                Username
                <input
                  name="username"
                  type="text"
                  value={editForm.username}
                  onChange={handleEditChange}
                  required
                />
              </label>
              <label>
                Profession
                <input
                  name="profession"
                  type="text"
                  value={editForm.profession}
                  onChange={handleEditChange}
                  required
                />
              </label>
              <label>
                Salary
                <input
                  name="salary"
                  type="number"
                  min="0"
                  value={editForm.salary}
                  onChange={handleEditChange}
                  required
                />
              </label>
              <div className="edit-form-actions">
                <button
                  className="cancel-button"
                  type="button"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </button>
                <button
                  className="save-update-button"
                  type="submit"
                  disabled={updating}
                >
                  {updating ? "Saving..." : "Save update"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
