async function getData() {
  const base = process.env.NEXT_PUBLIC_API_URL || "https://six-point-server-f8e839a224b2.herokuapp.com/api";
  const res = await fetch(`${base}/classes/public/list`, { cache: "no-store" });
  const data = await res.json();
  return data.data || [];
}
export default async function Page() {
  const classes = await getData();
  return (
    <div className="container">
      <h1>Class Schedule</h1>
      <div
        className="grid"
        style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}
      >
        {classes.map((c) => (
          <div className="card" key={c._id}>
            <h3>{c.name}</h3>
            <p>Type: {c.classType?.name}</p>
            <p>
              Allowed memberships:{" "}
              {(c.allowedMemberships || []).map((m) => m.name).join(", ")}
            </p>
            <p>
              Slots:{" "}
              {(c.timeSlots || [])
                .map((s) => `${s.name} ${s.startTime}-${s.endTime}`)
                .join(", ")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
