import { Platform } from "react-native";

/**
 * Android OkHttp fetch often dies with
 * `java.net.SocketException: Connection reset` (Supabase, tunnels, LAN).
 * XMLHttpRequest uses a different stack and usually works.
 */
function androidXhrFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return new Promise((resolve, reject) => {
    try {
      const request = typeof Request !== "undefined" && input instanceof Request ? input : null;
      const url = request ? request.url : input instanceof URL ? input.toString() : String(input);
      const method = (init?.method || request?.method || "GET").toUpperCase();
      const xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.responseType = "text";
      xhr.timeout = 60000;

      const headers = new Headers(request?.headers);
      if (init?.headers) new Headers(init.headers).forEach((value, key) => headers.set(key, value));
      headers.forEach((value, key) => {
        const lower = key.toLowerCase();
        if (["host", "content-length", "connection", "user-agent", "accept-encoding"].includes(lower)) {
          return;
        }
        xhr.setRequestHeader(key, value);
      });

      xhr.onload = () => {
        const responseHeaders = new Headers();
        (xhr.getAllResponseHeaders() || "")
          .trim()
          .split(/[\r\n]+/)
          .forEach((line) => {
            const index = line.indexOf(":");
            if (index > 0) {
              responseHeaders.append(line.slice(0, index).trim(), line.slice(index + 1).trim());
            }
          });
        resolve(
          new Response(xhr.responseText, {
            status: xhr.status,
            statusText: xhr.statusText,
            headers: responseHeaders,
          })
        );
      };
      xhr.onerror = () => reject(new TypeError("Network request failed"));
      xhr.ontimeout = () => reject(new TypeError("Network request timed out"));

      const body = init?.body ?? null;
      if (typeof body === "string" || body == null) {
        xhr.send(body);
      } else if (typeof Blob !== "undefined" && body instanceof Blob) {
        xhr.send(body);
      } else if (typeof ArrayBuffer !== "undefined" && body instanceof ArrayBuffer) {
        xhr.send(body);
      } else if (typeof FormData !== "undefined" && body instanceof FormData) {
        xhr.send(body);
      } else {
        xhr.send(String(body));
      }
    } catch (error) {
      reject(error);
    }
  });
}

function requestUrl(input: RequestInfo | URL): string {
  if (typeof Request !== "undefined" && input instanceof Request) return input.url;
  if (input instanceof URL) return input.toString();
  return String(input);
}

export async function nativeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  const url = requestUrl(input);
  if (url.includes("ngrok")) {
    headers.set("ngrok-skip-browser-warning", "1");
  }
  const next = { ...init, headers };

  if (Platform.OS !== "android") {
    return fetch(input, next);
  }

  // Prefer XHR on Android — avoids Connection reset from OkHttp.
  try {
    return await androidXhrFetch(input, next);
  } catch (xhrError) {
    try {
      return await fetch(input, next);
    } catch {
      throw xhrError;
    }
  }
}
