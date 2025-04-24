

export default function SettingPermission() {
  return (
    <div className="d-flex flex-column align-items-center px-3">
      <h2 className="mb-5 text-center">Setting Permission</h2>
      <div className="d-flex flex-column align-items-center w-100">
        <h5 className="fw-bold">Permission Name</h5>
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Enter permission name"
        />
        <button className="btn btn-primary">Save</button>
      </div>
    </div>
  );
}