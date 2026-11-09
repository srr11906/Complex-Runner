#!/usr/bin/env python3
"""
Zero-Cache Development HTTP Server for Complex Runner.
Forces browsers (desktop & mobile) to always fetch fresh assets with no caching.
"""

import http.server
import socketserver
import os
import sys

import mimetypes

mimetypes.add_type("audio/mpeg", ".mp3")
mimetypes.add_type("audio/mp4", ".m4a")
mimetypes.add_type("image/svg+xml", ".svg")
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("model/gltf-binary", ".glb")
mimetypes.add_type("model/gltf+json", ".gltf")

PORT = 8080
DIRECTORY = os.path.dirname(os.path.realpath(__file__))

class ThreadedHTTPServer(socketserver.ThreadingTCPServer):
    request_queue_size = 256
    allow_reuse_address = True
    daemon_threads = True

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {format % args}")

    def send_error(self, code, message=None, explain=None):
        print(f"SEND ERROR: code={code}, message={message}, explain={explain}, path={self.path}, translated={self.translate_path(self.path)}")
        super().send_error(code, message, explain)

    def end_headers(self):
        # Disable all caching aggressively for rapid dev & instant mobile testing
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Range')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.end_headers()

if __name__ == '__main__':
    with ThreadedHTTPServer(("0.0.0.0", PORT), NoCacheHTTPRequestHandler) as httpd:
        print(f"🚀 Complex Runner Multi-Threaded No-Cache Server running on http://0.0.0.0:{PORT}")
        print(f"📁 Serving directory: {DIRECTORY}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
            httpd.server_close()
            sys.exit(0)
