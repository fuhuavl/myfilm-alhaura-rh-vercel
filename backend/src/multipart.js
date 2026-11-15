// Parser multipart/form-data minimal (tanpa dependensi).
function parseMultipart(buffer, contentType) {
  const m = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType || "");
  if (!m) throw Object.assign(new Error("Boundary multipart tidak ditemukan"), { status: 400 });
  const boundary = Buffer.from("--" + (m[1] || m[2]));
  const fields = {};
  const files = [];

  let pos = buffer.indexOf(boundary);
  while (pos !== -1) {
    const start = pos + boundary.length;
    if (buffer.slice(start, start + 2).toString() === "--") break; // penutup
    const next = buffer.indexOf(boundary, start);
    if (next === -1) break;
    // bagian: \r\n headers \r\n\r\n body \r\n
    const part = buffer.slice(start + 2, next - 2);
    const headEnd = part.indexOf("\r\n\r\n");
    if (headEnd !== -1) {
      const head = part.slice(0, headEnd).toString("utf8");
      const body = part.slice(headEnd + 4);
      const name = /name="([^"]*)"/i.exec(head)?.[1];
      const filename = /filename="([^"]*)"/i.exec(head)?.[1];
      const type = /content-type:\s*([^\r\n]+)/i.exec(head)?.[1]?.trim();
      if (name) {
        if (filename !== undefined) {
          if (filename) files.push({ field: name, filename, type: type || "application/octet-stream", data: body });
        } else {
          fields[name] = body.toString("utf8");
        }
      }
    }
    pos = next;
  }
  return { fields, files };
}

module.exports = { parseMultipart };
