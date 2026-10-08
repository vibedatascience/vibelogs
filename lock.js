// Simple password gate. Add as the first tag in <head>:
// <script src="/lock.js" data-hash="SHA-256 hex of the password"></script>
// This only hides the page. The content is still in the page source.
(function () {
  var s = document.currentScript, hash = s && s.getAttribute("data-hash");
  if (!hash) return;
  var key = "lock:" + hash;
  try { if (localStorage.getItem(key) === "1") return; } catch (e) {}
  var st = document.createElement("style");
  st.textContent = "body>*:not(#lk){display:none!important}" +
    "#lk{position:fixed;inset:0;background:#fff;display:flex;align-items:center;justify-content:center;font:15px -apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;z-index:2147483647}" +
    "#lk form{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;padding:16px}" +
    "#lk input{font:inherit;padding:8px 10px;border:1px solid #ccc;border-radius:6px;width:220px}" +
    "#lk button{font:inherit;padding:8px 14px;border:0;border-radius:6px;background:#111;color:#fff;cursor:pointer}" +
    "#lk p{width:100%;text-align:center;margin:0 0 4px;color:#666}#lk .bad{color:#E60023}";
  document.head.appendChild(st);
  async function sha(t) {
    var b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t));
    return Array.from(new Uint8Array(b)).map(function (x) { return x.toString(16).padStart(2, "0"); }).join("");
  }
  function show() {
    var d = document.createElement("div");
    d.id = "lk";
    d.innerHTML = '<form><p>This page is private.</p><input type="password" placeholder="Password" autofocus autocomplete="current-password"><button>Open</button></form>';
    document.body.appendChild(d);
    var f = d.querySelector("form"), i = d.querySelector("input"), p = d.querySelector("p");
    i.focus();
    f.onsubmit = async function (e) {
      e.preventDefault();
      if (await sha(i.value.trim().toLowerCase()) === hash) {
        try { localStorage.setItem(key, "1"); } catch (e) {}
        d.remove(); st.remove();
      } else { p.textContent = "Wrong password."; p.className = "bad"; i.select(); }
    };
  }
  if (document.body) show(); else document.addEventListener("DOMContentLoaded", show);
})();
