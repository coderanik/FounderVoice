import { Platform } from "react-native";

/**
 * Android's built-in fetch resets the socket on some hosts
 * (`java.net.SocketException: Connection reset`). XMLHttpRequest uses the
 * other native stack and completes the same request.
 */
function androidFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return new Promise((resolve, reject) => {
    try {
      const request = typeof Request !== "undefined" && input instanceof Request ? input : null;
      const url = request ? request.url : input instanceof URL ? input.toString() : String(input);
      const method = (init?.method || request?.method || "GET").toUpperCase();
      const xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.responseType = "text";

      const headers = new Headers(request?.headers);
      if (init?.headers) new Headers(init.headers).forEach((value, key) => headers.set(key, value));
      headers.forEach((value, key) => xhr.setRequestHeader(key, value));

      xhr.onload = () => {
        const responseHeaders = new Headers();
        (xhr.getAllResponseHeaders() || "")
          .trim()
          .split(/[\r\n]+/)
          .forEach((line) => {
            const index = line.indexOf(":");
            if (index > 0) responseHeaders.append(line.slice(0, index).trim(), line.slice(index + 1).trim());
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
      if (typeof body === "string" || body == null) xhr.send(body);
      else xhr.send(body as XMLHttpRequestBodyInit);
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

export function nativeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (requestUrl(input).includes("ngrok")) {
    headers.set("ngrok-skip-browser-warning", "1");
  }
  const next = { ...init, headers };
  if (Platform.OS === "android") return androidFetch(input, next);
  return fetch(input, next);
}
