import type { PatternEntry } from "./types.ts";

/** Raw template tag that trims the leading newline and trailing whitespace. */
const src = (s: TemplateStringsArray, ...v: unknown[]) =>
  String.raw(s, ...v).replace(/^\n/, "").replace(/\s+$/, "");

export const patterns: PatternEntry[] = [
  // ─────────────────────────────── Creational ───────────────────────────────
  {
    kind: "pattern",
    id: "abstract-factory",
    name: "Abstract Factory",
    aka: ["Kit"],
    category: "Creational",
    intent: "Create families of related objects without naming their concrete classes.",
    when: [
      "Products must be used together and stay consistent (a light theme's button + checkbox).",
      "You want to swap a whole product family by changing one object (e.g. per platform or tenant).",
      "Client code should depend only on interfaces.",
    ],
    pitfalls: [
      "Adding a new product kind means changing every factory.",
      "Overkill for a single product - a plain Factory Method or a function is enough.",
    ],
    structure: src`
+--------+      +-------------------+
| Client |----->| WidgetFactory     | <<interface>>
+--------+      | + button()        |
    |           | + checkbox()      |
    |           +-------------------+
    |              ^             ^
    |       +-------------+ +------------+
    |       | LightFactory| | DarkFactory|
    |       +-------------+ +------------+
    |              | creates        | creates
    v              v                v
 Button, Checkbox  <--  LightButton ... DarkCheckbox`,
    code: src`
from abc import ABC, abstractmethod

class Button(ABC):
    @abstractmethod
    def render(self) -> str: ...

class Checkbox(ABC):
    @abstractmethod
    def render(self) -> str: ...

class LightButton(Button):
    def render(self): return "[ light button ]"
class LightCheckbox(Checkbox):
    def render(self): return "[x] light"
class DarkButton(Button):
    def render(self): return "[ dark button ]"
class DarkCheckbox(Checkbox):
    def render(self): return "[x] dark"

class WidgetFactory(ABC):
    @abstractmethod
    def button(self) -> Button: ...
    @abstractmethod
    def checkbox(self) -> Checkbox: ...

class LightFactory(WidgetFactory):
    def button(self): return LightButton()
    def checkbox(self): return LightCheckbox()

class DarkFactory(WidgetFactory):
    def button(self): return DarkButton()
    def checkbox(self): return DarkCheckbox()

def build_form(f: WidgetFactory) -> list[str]:
    # the client only knows the abstract factory and abstract products
    return [f.button().render(), f.checkbox().render()]

print(build_form(DarkFactory()))   # ['[ dark button ]', '[x] dark']`,
    related: ["factory-method", "prototype", "singleton", "dependency-injection"],
    tags: ["families", "polymorphism", "decoupling"],
  },
  {
    kind: "pattern",
    id: "builder",
    name: "Builder",
    category: "Creational",
    intent: "Construct a complex object step by step, separating construction from the final representation.",
    when: [
      "Constructors would need many optional parameters (telescoping constructors).",
      "You want validation of the whole object before it exists.",
      "The same steps should produce different representations (e.g. HTML vs Markdown report).",
    ],
    pitfalls: [
      "In Python, keyword arguments + dataclasses often make a builder unnecessary.",
      "Mutable builders are not thread-safe; build() should copy collections.",
    ],
    structure: src`
+----------+  uses  +--------------------+  build()  +---------+
| Director |------->| RequestBuilder     |---------->| Request |
+----------+        | + method(m): self  |           +---------+
 (optional)         | + header(k,v): self|          (immutable)
                    | + json(text): self |
                    | + build(): Request |
                    +--------------------+`,
    code: src`
from dataclasses import dataclass, field

@dataclass(frozen=True)
class Request:
    method: str
    url: str
    headers: dict = field(default_factory=dict)
    body: bytes | None = None
    timeout: float = 10.0

class RequestBuilder:
    def __init__(self, url: str):
        self._method, self._url = "GET", url
        self._headers: dict[str, str] = {}
        self._body: bytes | None = None
        self._timeout = 10.0

    def method(self, m: str) -> "RequestBuilder":
        self._method = m.upper(); return self
    def header(self, k: str, v: str) -> "RequestBuilder":
        self._headers[k] = v; return self
    def json(self, text: str) -> "RequestBuilder":
        self._body = text.encode()
        return self.header("Content-Type", "application/json")
    def timeout(self, s: float) -> "RequestBuilder":
        self._timeout = s; return self

    def build(self) -> Request:
        if self._body is not None and self._method == "GET":
            raise ValueError("GET request cannot have a body")
        return Request(self._method, self._url, dict(self._headers), self._body, self._timeout)

req = (RequestBuilder("https://api.example.com/items")
       .method("post").json('{"name": "pen"}').timeout(3).build())
print(req.method, req.headers)   # POST {'Content-Type': 'application/json'}`,
    related: ["abstract-factory", "composite", "prototype"],
    tags: ["fluent-api", "immutability", "validation"],
  },
  {
    kind: "pattern",
    id: "factory-method",
    name: "Factory Method",
    aka: ["Virtual Constructor"],
    category: "Creational",
    intent: "Define an interface for creating an object, but let subclasses decide which class to instantiate.",
    when: [
      "A base class implements an algorithm but a subclass should pick the concrete product.",
      "Framework code must create objects whose types are supplied by users of the framework.",
    ],
    pitfalls: [
      "Creates a parallel class hierarchy (one creator per product).",
      "In Python, passing a class or a callable is often simpler than subclassing.",
    ],
    structure: src`
+-------------------------+          +-------------+
| Exporter (Creator)      |--------->| Formatter   | <<interface>>
| + export(rows)          |  uses    +-------------+
| + create_formatter() *  |                 ^
+-------------------------+                 |
            ^                     +---------------+
            |                     | CsvFormatter  |
+-------------------------+       +---------------+
| CsvExporter             |  creates     ^
| + create_formatter() ---+--------------+
+-------------------------+     (* = abstract)`,
    code: src`
import json
from abc import ABC, abstractmethod

class Formatter(ABC):
    @abstractmethod
    def format(self, row: dict) -> str: ...

class CsvFormatter(Formatter):
    def format(self, row): return ",".join(str(v) for v in row.values())

class JsonFormatter(Formatter):
    def format(self, row): return json.dumps(row)

class Exporter(ABC):
    def export(self, rows: list[dict]) -> str:
        fmt = self.create_formatter()        # <- the factory method
        return "\n".join(fmt.format(r) for r in rows)

    @abstractmethod
    def create_formatter(self) -> Formatter: ...

class CsvExporter(Exporter):
    def create_formatter(self): return CsvFormatter()

class JsonExporter(Exporter):
    def create_formatter(self): return JsonFormatter()

rows = [{"id": 1, "name": "ada"}, {"id": 2, "name": "alan"}]
print(CsvExporter().export(rows))`,
    related: ["abstract-factory", "template-method", "prototype"],
    tags: ["inheritance", "polymorphism", "framework"],
  },
  {
    kind: "pattern",
    id: "prototype",
    name: "Prototype",
    category: "Creational",
    intent: "Create new objects by copying a configured prototype instead of building from scratch.",
    when: [
      "Objects are expensive to configure but cheap to copy.",
      "You need many variants of a preset (a registry of templates).",
      "The concrete class is only known at runtime.",
    ],
    pitfalls: [
      "Shallow copies share nested mutable state - usually you want copy.deepcopy.",
      "Objects holding resources (sockets, files, locks) do not clone safely.",
    ],
    structure: src`
+--------+  clone()  +------------------+
| Client |---------->| Shape            |
+--------+           | + clone(**over)  |
    |                +------------------+
    | lookup                  ^ copy.deepcopy
    v                         |
+---------------------+       |
| registry: name ->   |-------+
|   prototype         |
+---------------------+`,
    code: src`
import copy

class Shape:
    def __init__(self, kind: str, style: dict, points: list[tuple[int, int]]):
        self.kind, self.style, self.points = kind, style, points

    def clone(self, **overrides) -> "Shape":
        c = copy.deepcopy(self)          # deep: don't share nested lists/dicts
        for k, v in overrides.items():
            setattr(c, k, v)
        return c

registry = {
    "red-square": Shape("poly", {"fill": "red"}, [(0, 0), (1, 0), (1, 1), (0, 1)]),
}

a = registry["red-square"].clone()
a.points.append((2, 2))                  # does not affect the prototype
b = registry["red-square"].clone(style={"fill": "blue"})
print(len(registry["red-square"].points), b.style)   # 4 {'fill': 'blue'}`,
    related: ["abstract-factory", "factory-method", "memento"],
    tags: ["copy", "registry"],
  },
  {
    kind: "pattern",
    id: "singleton",
    name: "Singleton",
    category: "Creational",
    intent: "Ensure a class has exactly one instance and provide a global access point to it.",
    when: [
      "Exactly one shared resource must exist (process-wide config, a connection pool).",
      "Prefer passing the instance explicitly (DI) and enforcing 'one' at the composition root.",
    ],
    pitfalls: [
      "It is global state: hides dependencies and makes tests order-dependent.",
      "Lazy init needs locking under threads; per-process only (not across workers).",
      "In Python, a module-level object already is a singleton.",
    ],
    structure: src`
+----------------------------+
| Config                     |
| - _instance: Config = None |
| - _lock: Lock              |
| + __new__() -> Config      |---+ returns the same
+----------------------------+   | _instance every time
             ^-------------------+`,
    code: src`
import threading

class Config:
    _instance: "Config | None" = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:                  # double-checked locking
                if cls._instance is None:
                    inst = super().__new__(cls)
                    inst.settings = {"debug": False}
                    cls._instance = inst
        return cls._instance

assert Config() is Config()
print(Config().settings)

# Pythonic alternative - a module is imported once, so it is a singleton:
#   config.py:  settings = {"debug": False}
#   elsewhere:  from config import settings`,
    related: ["abstract-factory", "facade", "dependency-injection"],
    tags: ["global-state", "anti-pattern-risk", "concurrency"],
  },

  // ─────────────────────────────── Structural ───────────────────────────────
  {
    kind: "pattern",
    id: "adapter",
    name: "Adapter",
    aka: ["Wrapper"],
    category: "Structural",
    intent: "Convert the interface of a class into another interface clients expect.",
    when: [
      "Integrating a legacy or third-party API whose shape doesn't match yours.",
      "Isolating a vendor SDK behind your own port (hexagonal architecture).",
    ],
    pitfalls: [
      "Adapters that also add behaviour are really decorators - keep them thin.",
    ],
    structure: src`
+--------+      +------------+
| Client |----->| Logger     | <<target>>
+--------+      | + log()    |
                +------------+
                      ^
          +-----------------------+   delegates   +---------------+
          | PrinterLoggerAdapter  |-------------->| LegacyPrinter |
          | + log() -> print_text |               | + print_text()|
          +-----------------------+               +---------------+`,
    code: src`
class LegacyPrinter:                      # adaptee: incompatible API
    def print_text(self, text: str, upper: bool) -> None:
        print(text.upper() if upper else text)

class Logger:                             # target interface the client expects
    def log(self, level: str, msg: str) -> None:
        raise NotImplementedError

class PrinterLoggerAdapter(Logger):
    def __init__(self, printer: LegacyPrinter):
        self._p = printer                 # object adapter: composition
    def log(self, level, msg):
        self._p.print_text(f"[{level}] {msg}", upper=(level == "error"))

def run(logger: Logger):
    logger.log("info", "started")
    logger.log("error", "disk full")

run(PrinterLoggerAdapter(LegacyPrinter()))`,
    related: ["bridge", "decorator", "facade", "proxy"],
    tags: ["integration", "legacy", "interface"],
  },
  {
    kind: "pattern",
    id: "bridge",
    name: "Bridge",
    category: "Structural",
    intent: "Decouple an abstraction from its implementation so the two can vary independently.",
    when: [
      "Two orthogonal dimensions would otherwise multiply subclasses (Shape x Renderer).",
      "You want to switch implementations at runtime.",
    ],
    pitfalls: [
      "Needs up-front design; retrofitting is hard. Don't add it for one implementation.",
    ],
    structure: src`
+------------------+   has-a    +------------------+
| Shape            |<>--------->| Renderer         |
| + draw()         |            | + circle(x,y,r)  |
+------------------+            +------------------+
        ^                          ^            ^
+------------------+     +-------------+ +---------------+
| Circle           |     | SvgRenderer | | AsciiRenderer |
+------------------+     +-------------+ +---------------+`,
    code: src`
from abc import ABC, abstractmethod

class Renderer(ABC):                      # implementor
    @abstractmethod
    def circle(self, x: float, y: float, r: float) -> str: ...

class SvgRenderer(Renderer):
    def circle(self, x, y, r): return f'<circle cx="{x}" cy="{y}" r="{r}"/>'

class AsciiRenderer(Renderer):
    def circle(self, x, y, r): return f"(o) at {x},{y} r={r}"

class Shape(ABC):                         # abstraction holds a reference
    def __init__(self, renderer: Renderer):
        self.renderer = renderer
    @abstractmethod
    def draw(self) -> str: ...

class Circle(Shape):                      # refined abstraction
    def __init__(self, renderer, x, y, r):
        super().__init__(renderer)
        self.x, self.y, self.r = x, y, r
    def draw(self): return self.renderer.circle(self.x, self.y, self.r)

# M shapes + N renderers classes, instead of M x N subclasses
for r in (SvgRenderer(), AsciiRenderer()):
    print(Circle(r, 1, 2, 3).draw())`,
    related: ["adapter", "strategy", "abstract-factory"],
    tags: ["composition", "orthogonal-dimensions"],
  },
  {
    kind: "pattern",
    id: "composite",
    name: "Composite",
    category: "Structural",
    intent: "Compose objects into trees and let clients treat leaves and groups uniformly.",
    when: [
      "Part-whole hierarchies: file systems, UI widget trees, ASTs, org charts.",
      "Operations should recurse naturally (size, render, price).",
    ],
    pitfalls: [
      "Uniform interface may force meaningless methods on leaves (add() on a File).",
      "Watch for cycles if children can be shared.",
    ],
    structure: src`
+--------+      +-------------+
| Client |----->| Node        |<-----------+
+--------+      | + size()    |            | children
                +-------------+            |
                  ^         ^              |
          +--------+   +------------------+|
          | File   |   | Folder           |+
          | (leaf) |   | + add(n)         |
          +--------+   | + size() = sum() |
                       +------------------+`,
    code: src`
from abc import ABC, abstractmethod

class Node(ABC):
    @abstractmethod
    def size(self) -> int: ...

class File(Node):
    def __init__(self, name: str, nbytes: int):
        self.name, self.nbytes = name, nbytes
    def size(self): return self.nbytes

class Folder(Node):
    def __init__(self, name: str):
        self.name, self.children = name, []
    def add(self, n: Node) -> "Folder":
        self.children.append(n); return self
    def size(self): return sum(c.size() for c in self.children)  # uniform recursion

root = Folder("/").add(File("a.txt", 120)).add(
    Folder("src").add(File("main.py", 900)).add(File("util.py", 300)))
print(root.size())   # 1320`,
    related: ["iterator", "visitor", "decorator", "interpreter"],
    tags: ["tree", "recursion", "part-whole"],
  },
  {
    kind: "pattern",
    id: "decorator",
    name: "Decorator",
    aka: ["Wrapper"],
    category: "Structural",
    intent: "Attach responsibilities to an object dynamically by wrapping it in objects with the same interface.",
    when: [
      "Add cross-cutting behaviour (compression, encryption, caching, logging) in any combination.",
      "Subclassing for every combination would explode.",
    ],
    pitfalls: [
      "Order matters: compress-then-encrypt != encrypt-then-compress.",
      "Deep wrapper stacks are hard to debug; identity checks break.",
      "Python's @decorator is the function-level cousin of this pattern.",
    ],
    structure: src`
+-------------+
| DataSource  |<------------------+
| + write()   |                   | wraps (same interface)
+-------------+                   |
   ^        ^                     |
+------+  +------------------+    |
| File |  | SourceDecorator  |<>--+
+------+  +------------------+
             ^            ^
       +----------+  +---------+
       | Compress |  | Encrypt |
       +----------+  +---------+`,
    code: src`
import functools
from abc import ABC, abstractmethod

class DataSource(ABC):
    @abstractmethod
    def write(self, data: str) -> str: ...

class FileSource(DataSource):
    def write(self, data): return data          # pretend: wrote bytes to disk

class SourceDecorator(DataSource):
    def __init__(self, inner: DataSource):
        self.inner = inner                      # same interface, wraps another

class Compress(SourceDecorator):
    def write(self, data): return self.inner.write(f"zip({data})")

class Encrypt(SourceDecorator):
    def write(self, data): return self.inner.write(f"aes({data})")

src = Compress(Encrypt(FileSource()))           # compose at runtime
print(src.write("secret"))                      # aes(zip(secret))

# function-level decorator (Python syntax sugar for the same idea)
def logged(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        print("call", fn.__name__)
        return fn(*args, **kwargs)
    return wrapper

@logged
def add(a, b): return a + b
print(add(2, 3))`,
    related: ["adapter", "composite", "proxy", "strategy", "chain-of-responsibility"],
    tags: ["wrapping", "composition", "cross-cutting"],
  },
  {
    kind: "pattern",
    id: "facade",
    name: "Facade",
    category: "Structural",
    intent: "Provide one simple interface to a complex subsystem.",
    when: [
      "Callers need a common workflow, not every knob of several subsystems.",
      "Layering: give each layer a single entry point.",
    ],
    pitfalls: [
      "Can grow into a 'god object' - keep it a thin orchestration layer.",
    ],
    structure: src`
+--------+     +----------------------+
| Client |---->| CheckoutFacade       |
+--------+     | + place_order(...)   |
               +----------------------+
                 |        |        |
                 v        v        v
          +-----------+ +--------+ +----------+
          | Inventory | |Payments| | Shipping |
          +-----------+ +--------+ +----------+`,
    code: src`
class Inventory:
    def reserve(self, sku: str, qty: int) -> bool: return True
class Payments:
    def charge(self, user: str, cents: int) -> str: return "txn_42"
class Shipping:
    def schedule(self, user: str, sku: str) -> str: return "TRACK-9"

class CheckoutFacade:
    """One simple entry point over several subsystems."""
    def __init__(self):
        self.inv, self.pay, self.ship = Inventory(), Payments(), Shipping()

    def place_order(self, user: str, sku: str, qty: int, cents: int) -> dict:
        if not self.inv.reserve(sku, qty):
            raise RuntimeError("out of stock")
        txn = self.pay.charge(user, cents * qty)
        return {"txn": txn, "tracking": self.ship.schedule(user, sku)}

print(CheckoutFacade().place_order("ada", "pen-01", 2, 199))`,
    related: ["adapter", "mediator", "singleton", "saga"],
    tags: ["simplification", "layering"],
  },
  {
    kind: "pattern",
    id: "flyweight",
    name: "Flyweight",
    category: "Structural",
    intent: "Share fine-grained immutable objects to support huge numbers of them efficiently.",
    when: [
      "Millions of similar objects (glyphs, map tiles, particles) whose common state can be shared.",
      "State splits cleanly into intrinsic (shared) and extrinsic (per use, passed in).",
    ],
    pitfalls: [
      "Shared objects must be immutable.",
      "Adds lookup cost; measure memory first. Python: functools.lru_cache / sys.intern are flyweights.",
    ],
    structure: src`
+--------+  get(key)  +---------------+  pool  +------------------+
| Client |----------->| StyleFactory  |<>----->| GlyphStyle       |
+--------+            +---------------+        | font,size,color  |
    |                                          | (intrinsic,      |
    | keeps extrinsic state:                   |  immutable)      |
    | (char, position, style-ref)              +------------------+`,
    code: src`
from dataclasses import dataclass

@dataclass(frozen=True)
class GlyphStyle:                 # intrinsic, shared, immutable
    font: str
    size: int
    color: str

class StyleFactory:
    _pool: dict[tuple, GlyphStyle] = {}

    @classmethod
    def get(cls, font: str, size: int, color: str) -> GlyphStyle:
        key = (font, size, color)
        if key not in cls._pool:
            cls._pool[key] = GlyphStyle(*key)
        return cls._pool[key]

# extrinsic state (char, position) lives outside the flyweight
doc = [(ch, i, StyleFactory.get("Serif", 12, "black")) for i, ch in enumerate("hello world")]
print(len(doc), "glyphs share", len(StyleFactory._pool), "style object")`,
    related: ["composite", "singleton", "state"],
    tags: ["memory", "caching", "immutability"],
  },
  {
    kind: "pattern",
    id: "proxy",
    name: "Proxy",
    aka: ["Surrogate"],
    category: "Structural",
    intent: "Provide a stand-in that controls access to another object (lazy, remote, protection, caching).",
    when: [
      "Lazy loading of expensive objects (virtual proxy).",
      "Access control, rate limiting, logging, or caching in front of a service.",
      "Local representative of a remote object (RPC stubs).",
    ],
    pitfalls: [
      "Hidden latency: a cheap-looking call may hit the network.",
      "Proxy vs Decorator: same shape, but a proxy manages the subject's lifecycle/access.",
    ],
    structure: src`
+--------+      +-----------+
| Client |----->| Image     | <<interface>>
+--------+      | + show()  |
                +-----------+
                  ^       ^
      +-------------+   +----------------+
      | RealImage   |<--| LazyImage      |
      | (expensive) |   | creates on     |
      +-------------+   | first show()   |
                        +----------------+`,
    code: src`
from abc import ABC, abstractmethod

class Image(ABC):
    @abstractmethod
    def show(self) -> str: ...

class RealImage(Image):
    def __init__(self, path: str):
        print(f"loading {path} (expensive)")
        self.path = path
    def show(self): return f"<{self.path}>"

class LazyImage(Image):                 # virtual + protection proxy
    def __init__(self, path: str, allowed: bool = True):
        self.path, self.allowed = path, allowed
        self._real: RealImage | None = None
    def show(self):
        if not self.allowed:
            raise PermissionError(self.path)
        if self._real is None:          # create on first use
            self._real = RealImage(self.path)
        return self._real.show()

img = LazyImage("huge.png")             # nothing loaded yet
print(img.show())
print(img.show())                       # loads only once`,
    related: ["adapter", "decorator", "flyweight", "circuit-breaker"],
    tags: ["lazy-loading", "access-control", "remote"],
  },

  // ─────────────────────────────── Behavioral ───────────────────────────────
  {
    kind: "pattern",
    id: "chain-of-responsibility",
    name: "Chain of Responsibility",
    category: "Behavioral",
    intent: "Pass a request along a chain of handlers; each either handles it or forwards it.",
    when: [
      "HTTP middleware, event bubbling, approval workflows, logging levels.",
      "The set or order of handlers should be configurable.",
    ],
    pitfalls: [
      "A request may silently fall off the end - add a terminal handler.",
      "Long chains are hard to trace; log which handler responded.",
    ],
    structure: src`
+--------+    +---------+ next +-----------+ next +---------+
| Client |--->| Auth    |----->| RateLimit |----->| App     |
+--------+    +---------+      +-----------+      +---------+
                 each: handle(req) -> respond OR next.handle(req)`,
    code: src`
from __future__ import annotations

class Handler:
    def __init__(self, nxt: Handler | None = None):
        self.nxt = nxt
    def handle(self, req: dict) -> str:
        return self.nxt.handle(req) if self.nxt else "404 unhandled"

class Auth(Handler):
    def handle(self, req):
        if not req.get("user"):
            return "401 Unauthorized"
        return super().handle(req)

class RateLimit(Handler):
    def __init__(self, nxt=None, limit=3):
        super().__init__(nxt)
        self.limit, self.seen = limit, {}
    def handle(self, req):
        n = self.seen[req["user"]] = self.seen.get(req["user"], 0) + 1
        if n > self.limit:
            return "429 Too Many Requests"
        return super().handle(req)

class App(Handler):
    def handle(self, req): return f"200 hello {req['user']}"

chain = Auth(RateLimit(App(), limit=2))
print([chain.handle({"user": "ada"}) for _ in range(3)], chain.handle({}))`,
    related: ["decorator", "command", "composite"],
    tags: ["middleware", "pipeline", "decoupling"],
  },
  {
    kind: "pattern",
    id: "command",
    name: "Command",
    aka: ["Action", "Transaction"],
    category: "Behavioral",
    intent: "Encapsulate a request as an object so you can queue, log, undo or replay it.",
    when: [
      "Undo/redo, macro recording, job queues, transactional scripts.",
      "Decouple the object that invokes an operation from the one that performs it.",
    ],
    pitfalls: [
      "Undo needs enough captured state; non-reversible side effects (emails) can't be undone.",
      "For simple cases a closure / functools.partial is a command.",
    ],
    structure: src`
+---------+  run(cmd)  +-----------+         +------------+
| Client  |----------->| History   |<>------>| Command    |
+---------+            | (invoker) |  stack  | + execute()|
                       +-----------+         | + undo()   |
                                             +------------+
                                                   ^
                                  +-------------------------+   acts on
                                  | Insert(editor, text)    |--------> Editor
                                  +-------------------------+         (receiver)`,
    code: src`
from abc import ABC, abstractmethod

class Command(ABC):
    @abstractmethod
    def execute(self) -> None: ...
    @abstractmethod
    def undo(self) -> None: ...

class Editor:                         # receiver
    def __init__(self): self.text = ""

class Insert(Command):
    def __init__(self, ed: Editor, s: str): self.ed, self.s = ed, s
    def execute(self): self.ed.text += self.s
    def undo(self): self.ed.text = self.ed.text[: len(self.ed.text) - len(self.s)]

class History:                        # invoker
    def __init__(self): self.done: list[Command] = []
    def run(self, c: Command):
        c.execute(); self.done.append(c)
    def undo(self):
        if self.done:
            self.done.pop().undo()

ed, h = Editor(), History()
h.run(Insert(ed, "Hello")); h.run(Insert(ed, ", world"))
h.undo()
print(ed.text)   # Hello`,
    related: ["memento", "chain-of-responsibility", "event-sourcing", "cqrs"],
    tags: ["undo", "queue", "decoupling"],
  },
  {
    kind: "pattern",
    id: "interpreter",
    name: "Interpreter",
    category: "Behavioral",
    intent: "Represent a grammar as classes and evaluate sentences by walking the resulting tree.",
    when: [
      "Small DSLs: filters, rule engines, query builders, calculators.",
      "The grammar is simple and performance is not critical.",
    ],
    pitfalls: [
      "Complex grammars want a parser generator (lark, ANTLR) instead.",
      "Never eval() untrusted input as a shortcut.",
    ],
    structure: src`
                +--------------+
                | Expr         |<-----------+
                | + eval(env)  |            | operands
                +--------------+            |
            ^        ^        ^      ^      |
        +-----+  +-----+  +-------+ +-------+
        | Num |  | Var |  | Add   | | Mul   |
        +-----+  +-----+  | l, r  | | l, r  |
       (terminals)        +-------+ +-------+
                         (non-terminals)`,
    code: src`
from dataclasses import dataclass

class Expr:
    def eval(self, env: dict[str, int]) -> int: raise NotImplementedError

@dataclass
class Num(Expr):
    v: int
    def eval(self, env): return self.v

@dataclass
class Var(Expr):
    name: str
    def eval(self, env): return env[self.name]

@dataclass
class Add(Expr):
    l: Expr
    r: Expr
    def eval(self, env): return self.l.eval(env) + self.r.eval(env)

@dataclass
class Mul(Expr):
    l: Expr
    r: Expr
    def eval(self, env): return self.l.eval(env) * self.r.eval(env)

# grammar:  expr := Num | Var | Add(expr, expr) | Mul(expr, expr)
ast = Add(Num(2), Mul(Var("x"), Num(5)))      # 2 + x * 5
print(ast.eval({"x": 4}))                      # 22`,
    related: ["composite", "visitor", "iterator"],
    tags: ["dsl", "ast", "grammar", "recursion"],
  },
  {
    kind: "pattern",
    id: "iterator",
    name: "Iterator",
    aka: ["Cursor"],
    category: "Behavioral",
    intent: "Access elements of a collection sequentially without exposing its representation.",
    when: [
      "Traversing trees/graphs/paginated APIs with a uniform for-loop.",
      "Lazy, possibly infinite sequences; multiple independent cursors.",
    ],
    pitfalls: [
      "Mutating a collection while iterating it.",
      "Iterators are single-pass: an exhausted generator yields nothing more.",
    ],
    structure: src`
+--------+  iter()  +--------------+  creates  +------------------+
| Client |--------->| Tree         |---------->| generator        |
+--------+          | + __iter__() |           | + __next__()     |
     |              +--------------+           | (keeps own stack)|
     +---- next() -------------------------->  +------------------+`,
    code: src`
from collections.abc import Iterator

class Tree:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

    def __iter__(self) -> Iterator:          # lazy in-order traversal
        stack, node = [], self
        while stack or node:
            while node:
                stack.append(node)
                node = node.left
            node = stack.pop()
            yield node.val
            node = node.right

t = Tree(4, Tree(2, Tree(1), Tree(3)), Tree(6, Tree(5)))
print(list(t))                     # [1, 2, 3, 4, 5, 6]
it = iter(t)
print(next(it), next(it))          # 1 2  (independent cursor)`,
    related: ["composite", "visitor", "memento"],
    tags: ["traversal", "generator", "lazy"],
  },
  {
    kind: "pattern",
    id: "mediator",
    name: "Mediator",
    category: "Behavioral",
    intent: "Centralise complex communication between objects so they don't refer to each other directly.",
    when: [
      "Many-to-many interactions (chat rooms, form widgets, air-traffic control).",
      "You want to reuse components that would otherwise be tangled together.",
    ],
    pitfalls: [
      "The mediator itself can become a god object.",
    ],
    structure: src`
+--------+                     +--------+
| User A |---+             +---| User C |
+--------+   |  send()     |   +--------+
             v             v
           +-----------------+
           | ChatRoom        |  routes messages;
           | (mediator)      |  colleagues know only it
           +-----------------+
             ^
+--------+   |
| User B |---+`,
    code: src`
class ChatRoom:                                   # mediator
    def __init__(self): self.members: dict[str, "User"] = {}
    def join(self, u: "User"):
        self.members[u.name] = u
        u.room = self
    def send(self, sender: str, msg: str, to: str | None = None):
        if to:
            targets = [self.members[to]]
        else:
            targets = [m for name, m in self.members.items() if name != sender]
        for m in targets:
            m.receive(sender, msg)

class User:                                       # colleague
    def __init__(self, name: str):
        self.name, self.room, self.inbox = name, None, []
    def say(self, msg: str, to: str | None = None):
        self.room.send(self.name, msg, to)
    def receive(self, sender: str, msg: str):
        self.inbox.append(f"{sender}: {msg}")

room = ChatRoom()
a, b, c = User("ada"), User("bob"), User("cy")
for u in (a, b, c):
    room.join(u)
a.say("hi all"); b.say("psst", to="cy")
print(c.inbox)     # ['ada: hi all', 'bob: psst']`,
    related: ["observer", "facade", "pub-sub"],
    tags: ["decoupling", "coordination"],
  },
  {
    kind: "pattern",
    id: "memento",
    name: "Memento",
    aka: ["Snapshot", "Token"],
    category: "Behavioral",
    intent: "Capture and restore an object's internal state without violating encapsulation.",
    when: [
      "Undo, checkpoints, 'cancel' in dialogs, game save states.",
    ],
    pitfalls: [
      "Snapshots of large state are memory-hungry - store diffs or cap history.",
      "Mementos must be immutable and opaque to the caretaker.",
    ],
    structure: src`
+---------------+  save()   +-------------+
| Editor        |---------->| Snapshot    |  (immutable, opaque)
| (originator)  |<----------| text,cursor |
| + save()      | restore() +-------------+
| + restore(m)  |                  ^
+---------------+                  | stores, never inspects
                            +--------------+
                            | history list |  (caretaker)
                            +--------------+`,
    code: src`
from dataclasses import dataclass

@dataclass(frozen=True)
class Snapshot:                 # memento: opaque, immutable state
    text: str
    cursor: int

class Editor:                   # originator
    def __init__(self):
        self.text, self.cursor = "", 0
    def type(self, s: str):
        self.text = self.text[: self.cursor] + s + self.text[self.cursor :]
        self.cursor += len(s)
    def save(self) -> Snapshot:
        return Snapshot(self.text, self.cursor)
    def restore(self, m: Snapshot):
        self.text, self.cursor = m.text, m.cursor

ed, history = Editor(), []      # caretaker stores mementos, never inspects them
ed.type("Hello"); history.append(ed.save())
ed.type(" world!!")
ed.restore(history.pop())
print(repr(ed.text))            # 'Hello'`,
    related: ["command", "prototype", "event-sourcing"],
    tags: ["undo", "snapshot", "encapsulation"],
  },
  {
    kind: "pattern",
    id: "observer",
    name: "Observer",
    aka: ["Listener", "Event subscriber"],
    category: "Behavioral",
    intent: "Define a one-to-many dependency so that when one object changes, its dependents are notified.",
    when: [
      "UI data binding, model -> view updates, domain events within a process.",
      "The subject shouldn't know concrete observer types.",
    ],
    pitfalls: [
      "Forgotten subscriptions leak memory (consider weakref / return an unsubscribe handle).",
      "Notification order and re-entrancy surprises; exceptions in one observer can stop the rest.",
    ],
    structure: src`
+---------------------+  notify(e)   +--------------------+
| Subject             |------------->| Observer           |*
| + subscribe(fn)     |  for each    | (callable(e))      |
| + notify(e)         |              +--------------------+
+---------------------+                 ^        ^
                                   +--------+ +--------+
                                   | logger | | alerts |
                                   +--------+ +--------+`,
    code: src`
from collections.abc import Callable

class Subject:
    def __init__(self):
        self._observers: list[Callable[[str, float], None]] = []

    def subscribe(self, fn: Callable[[str, float], None]) -> Callable[[], None]:
        self._observers.append(fn)
        return lambda: self._observers.remove(fn)      # unsubscribe handle

    def notify(self, symbol: str, price: float):
        for fn in list(self._observers):               # copy: safe if one unsubscribes
            fn(symbol, price)

ticker, log = Subject(), []
unsub = ticker.subscribe(lambda s, p: log.append(f"{s}={p}"))
ticker.subscribe(lambda s, p: p > 100 and log.append(f"ALERT {s}"))
ticker.notify("ACME", 99.5)
ticker.notify("ACME", 101.0)
unsub()
ticker.notify("ACME", 50.0)
print(log)   # ['ACME=99.5', 'ACME=101.0', 'ALERT ACME']`,
    related: ["mediator", "pub-sub", "event-sourcing"],
    tags: ["events", "reactive", "decoupling"],
  },
  {
    kind: "pattern",
    id: "state",
    name: "State",
    category: "Behavioral",
    intent: "Let an object change its behaviour when its internal state changes, as if it changed class.",
    when: [
      "Big if/elif chains on a 'status' field across many methods.",
      "Explicit finite-state machines: protocols, workflows, game AI, parsers.",
    ],
    pitfalls: [
      "Many tiny classes for small machines - a transition table dict may be clearer.",
    ],
    structure: src`
+-------------------+  delegates  +----------------+
| Turnstile         |<>---------->| State          |
| (context)         |             | + insert_coin()|
| + insert_coin()   |             | + push()       |
| + push()          |             +----------------+
+-------------------+               ^          ^
                              +--------+  +----------+
                              | Locked |  | Unlocked |
                              +--------+  +----------+
      coin: Locked -> Unlocked     push: Unlocked -> Locked`,
    code: src`
class State:
    def insert_coin(self, m: "Turnstile"): pass
    def push(self, m: "Turnstile"): pass

class Locked(State):
    def insert_coin(self, m):
        m.state = UNLOCKED; m.log.append("unlocked")
    def push(self, m):
        m.log.append("blocked")

class Unlocked(State):
    def insert_coin(self, m):
        m.log.append("refund")
    def push(self, m):
        m.state = LOCKED; m.log.append("passed")

LOCKED, UNLOCKED = Locked(), Unlocked()       # stateless states can be shared

class Turnstile:                              # context delegates to its state
    def __init__(self):
        self.state, self.log = LOCKED, []
    def insert_coin(self): self.state.insert_coin(self)
    def push(self): self.state.push(self)

t = Turnstile()
t.push(); t.insert_coin(); t.insert_coin(); t.push()
print(t.log)   # ['blocked', 'unlocked', 'refund', 'passed']`,
    related: ["strategy", "flyweight", "singleton"],
    tags: ["fsm", "polymorphism"],
  },
  {
    kind: "pattern",
    id: "strategy",
    name: "Strategy",
    aka: ["Policy"],
    category: "Behavioral",
    intent: "Define a family of interchangeable algorithms and select one at runtime.",
    when: [
      "Pricing rules, sort keys, compression codecs, retry policies, auth methods.",
      "Replace conditionals that pick an algorithm.",
    ],
    pitfalls: [
      "Clients must know which strategy to choose; pair with a factory or config.",
      "In Python, a strategy is usually just a function - don't build a class hierarchy for it.",
    ],
    structure: src`
+--------------------+       +----------------------+
| Cart (context)     |<>---->| Pricing              |
| + total()          |       | (float) -> float     |
+--------------------+       +----------------------+
                               ^        ^         ^
                         +---------+ +--------+ +------+
                         | regular | | member | | bulk |
                         +---------+ +--------+ +------+`,
    code: src`
from collections.abc import Callable
from dataclasses import dataclass

Pricing = Callable[[float], float]      # a strategy can simply be a function

def regular(total: float) -> float: return total
def member(total: float) -> float: return total * 0.9
def bulk(total: float) -> float: return total - 20 if total >= 200 else total

@dataclass
class Cart:
    items: list[float]
    pricing: Pricing = regular          # swap the algorithm at runtime
    def total(self) -> float:
        return round(self.pricing(sum(self.items)), 2)

cart = Cart([120.0, 95.0])
for strat in (regular, member, bulk):
    cart.pricing = strat
    print(strat.__name__, cart.total())   # 215.0 / 193.5 / 195.0`,
    related: ["state", "template-method", "bridge", "decorator"],
    tags: ["polymorphism", "first-class-functions"],
  },
  {
    kind: "pattern",
    id: "template-method",
    name: "Template Method",
    category: "Behavioral",
    intent: "Define an algorithm's skeleton in a base class and let subclasses override specific steps.",
    when: [
      "Several variants share the same high-level steps (ETL pipelines, test fixtures, game loops).",
      "Frameworks that call user hooks.",
    ],
    pitfalls: [
      "Inheritance-based: deep hierarchies get rigid. Strategy (composition) is often preferable.",
    ],
    structure: src`
+------------------------------+
| DataPipeline                 |
| + run()  <- fixed skeleton:  |
|     extract -> transform     |
|     -> keep? -> load         |
| # extract() *                |
| # transform() *              |
| # keep()  (hook, default)    |
+------------------------------+
               ^
+------------------------------+
| CsvNumbers: extract,         |
| transform, keep overridden   |
+------------------------------+`,
    code: src`
from abc import ABC, abstractmethod

class DataPipeline(ABC):
    def run(self, src: str) -> list:            # template method: fixed skeleton
        rows = [self.transform(r) for r in self.extract(src)]
        rows = [r for r in rows if self.keep(r)]
        self.load(rows)
        return rows

    @abstractmethod
    def extract(self, src: str) -> list: ...
    @abstractmethod
    def transform(self, row): ...
    def keep(self, row) -> bool: return True    # hook with a default
    def load(self, rows: list) -> None: print(f"loaded {len(rows)} rows")

class CsvNumbers(DataPipeline):
    def extract(self, src): return src.split(",")
    def transform(self, row): return int(row)
    def keep(self, row): return row % 2 == 0

print(CsvNumbers().run("1,2,3,4,10"))   # [2, 4, 10]`,
    related: ["factory-method", "strategy"],
    tags: ["inheritance", "hooks", "framework"],
  },
  {
    kind: "pattern",
    id: "visitor",
    name: "Visitor",
    category: "Behavioral",
    intent: "Add new operations over a fixed object structure without changing the element classes.",
    when: [
      "Compilers/ASTs: type-check, pretty-print, optimise, codegen over the same node types.",
      "Element hierarchy is stable but operations keep growing.",
    ],
    pitfalls: [
      "Adding a new element type forces changes in every visitor.",
      "In Python 3.10+, structural pattern matching (match/case) or functools.singledispatch is often simpler.",
    ],
    structure: src`
+---------------+  accept(v)   +----------------+
| Element       |------------->| Visitor        |
| + accept(v)   |  v.visit_X() | + visit_num()  |
+---------------+  (double     | + visit_add()  |
   ^        ^      dispatch)   +----------------+
+-----+  +-----+                 ^          ^
| Num |  | Add |         +-----------+ +---------+
+-----+  +-----+         | Evaluator | | Printer |
                         +-----------+ +---------+`,
    code: src`
from __future__ import annotations
from dataclasses import dataclass

@dataclass
class Num:
    v: float
    def accept(self, vis): return vis.visit_num(self)

@dataclass
class Add:
    l: Num | Add
    r: Num | Add
    def accept(self, vis): return vis.visit_add(self)

class Evaluator:                         # one operation = one visitor
    def visit_num(self, n): return n.v
    def visit_add(self, a): return a.l.accept(self) + a.r.accept(self)

class Printer:                           # new operation, no change to Num/Add
    def visit_num(self, n): return str(n.v)
    def visit_add(self, a): return f"({a.l.accept(self)} + {a.r.accept(self)})"

tree = Add(Num(1), Add(Num(2), Num(3)))
print(tree.accept(Printer()), "=", tree.accept(Evaluator()))   # (1 + (2 + 3)) = 6`,
    related: ["composite", "interpreter", "iterator"],
    tags: ["double-dispatch", "ast", "operations"],
  },

  // ─────────────────────────────── Modern ───────────────────────────────
  {
    kind: "pattern",
    id: "dependency-injection",
    name: "Dependency Injection",
    aka: ["DI", "Inversion of Control"],
    category: "Modern",
    intent: "Give an object its collaborators from the outside instead of having it construct them.",
    when: [
      "Unit testing with fakes; swapping infrastructure (SMTP vs SES, SQL vs in-memory).",
      "Wire everything once in a composition root (main / app factory).",
    ],
    pitfalls: [
      "Service locators and global containers reintroduce hidden dependencies.",
      "Constructor parameter lists that grow very long signal a class doing too much.",
    ],
    structure: src`
+----------------------+   creates + injects   +----------------+
| Composition root     |---------------------->| InvoiceService |
| (main / app factory) |                       | (clock, mailer)|
+----------------------+                       +----------------+
     |          |                                 |        |
     v          v                                 v        v
 SystemClock  SmtpMailer   (prod)       Clock <<proto>>  Mailer <<proto>>
 FixedClock   FakeMailer   (tests)`,
    code: src`
import time
from typing import Protocol

class Clock(Protocol):
    def now(self) -> int: ...

class Mailer(Protocol):
    def send(self, to: str, body: str) -> None: ...

class SystemClock:
    def now(self) -> int: return int(time.time())

class InvoiceService:
    # dependencies are passed in, never constructed inside
    def __init__(self, clock: Clock, mailer: Mailer):
        self.clock, self.mailer = clock, mailer
    def remind(self, user: str, due: int):
        if self.clock.now() > due:
            self.mailer.send(user, "Your invoice is overdue")

# --- in tests: inject fakes ---------------------------------
class FixedClock:
    def __init__(self, t): self.t = t
    def now(self): return self.t

class FakeMailer:
    def __init__(self): self.sent = []
    def send(self, to, body): self.sent.append((to, body))

m = FakeMailer()
InvoiceService(FixedClock(100), m).remind("ada", due=50)
print(m.sent)   # [('ada', 'Your invoice is overdue')]

# --- composition root (main): wire real implementations once ---
# service = InvoiceService(SystemClock(), SmtpMailer(host="..."))`,
    related: ["strategy", "abstract-factory", "repository", "singleton"],
    tags: ["testing", "decoupling", "architecture"],
  },
  {
    kind: "pattern",
    id: "repository",
    name: "Repository",
    category: "Modern",
    intent: "Mediate between the domain and data mapping with a collection-like interface for aggregates.",
    when: [
      "Keep SQL/ORM details out of business logic.",
      "Swap storage in tests (in-memory) without touching the domain.",
    ],
    pitfalls: [
      "Generic 'Repository<T>' with every query method becomes a leaky DAO.",
      "Hiding the ORM can hide N+1 queries - expose purpose-specific methods.",
    ],
    structure: src`
+---------------+      +-----------------------+
| Domain logic  |----->| UserRepository        | <<protocol>>
+---------------+      | + get(id)             |
                       | + add(user)           |
                       | + find_by_email(e)    |
                       +-----------------------+
                           ^               ^
               +----------------+   +--------------+
               | InMemoryRepo   |   | SqlUserRepo  |---> DB
               | (tests)        |   | (prod)       |
               +----------------+   +--------------+`,
    code: src`
import sqlite3
from dataclasses import dataclass
from typing import Protocol

@dataclass
class User:
    id: int
    email: str

class UserRepository(Protocol):               # collection-like, domain-facing
    def get(self, user_id: int) -> User | None: ...
    def add(self, user: User) -> None: ...
    def find_by_email(self, email: str) -> User | None: ...

class InMemoryUserRepo:                       # for tests
    def __init__(self): self._rows: dict[int, User] = {}
    def get(self, user_id): return self._rows.get(user_id)
    def add(self, user): self._rows[user.id] = user
    def find_by_email(self, email):
        return next((u for u in self._rows.values() if u.email == email), None)

class SqlUserRepo:                            # production: hides SQL
    def __init__(self, conn: sqlite3.Connection): self.conn = conn
    def get(self, user_id):
        row = self.conn.execute("SELECT id, email FROM users WHERE id = ?", (user_id,)).fetchone()
        return User(*row) if row else None
    def add(self, user):
        self.conn.execute("INSERT INTO users (id, email) VALUES (?, ?)", (user.id, user.email))
    def find_by_email(self, email):
        row = self.conn.execute("SELECT id, email FROM users WHERE email = ?", (email,)).fetchone()
        return User(*row) if row else None

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT UNIQUE)")
for repo in (InMemoryUserRepo(), SqlUserRepo(conn)):
    repo.add(User(1, "ada@example.com"))
    print(type(repo).__name__, repo.find_by_email("ada@example.com"))`,
    related: ["unit-of-work", "dependency-injection", "cqrs", "facade"],
    tags: ["persistence", "ddd", "testing"],
  },
  {
    kind: "pattern",
    id: "unit-of-work",
    name: "Unit of Work",
    category: "Modern",
    intent: "Track changes made during a business transaction and commit (or roll back) them atomically.",
    when: [
      "A use case touches several repositories/rows that must succeed or fail together.",
      "Pairs with Repository: repositories register changes, the UoW owns the transaction.",
    ],
    pitfalls: [
      "Keep transactions short; never wait on users or remote calls inside one.",
      "A UoW does not span services - across services use a Saga.",
    ],
    structure: src`
+--------------+  with uow:   +----------------------+
| Use case     |------------->| UnitOfWork           |
| transfer()   |              | __enter__: BEGIN     |
+--------------+              | __exit__: COMMIT or  |
                              |           ROLLBACK   |
                              | .users, .accounts    |--> repositories
                              +----------------------+    share one conn`,
    code: src`
import sqlite3

class UnitOfWork:
    """Collects changes and commits them atomically (all or nothing)."""
    def __init__(self, conn: sqlite3.Connection):
        self.conn = conn          # real code: self.accounts = AccountRepo(conn), ...
    def __enter__(self):
        self.conn.execute("BEGIN")
        return self
    def __exit__(self, exc_type, exc, tb):
        self.conn.execute("COMMIT" if exc_type is None else "ROLLBACK")
        return False              # don't swallow the exception

conn = sqlite3.connect(":memory:", isolation_level=None)   # manual transactions
conn.execute("CREATE TABLE acct (id TEXT PRIMARY KEY, bal INT CHECK (bal >= 0))")
conn.executemany("INSERT INTO acct VALUES (?, ?)", [("a", 100), ("b", 0)])

def transfer(src: str, dst: str, amt: int):
    with UnitOfWork(conn) as uow:
        uow.conn.execute("UPDATE acct SET bal = bal + ? WHERE id = ?", (amt, dst))
        uow.conn.execute("UPDATE acct SET bal = bal - ? WHERE id = ?", (amt, src))

transfer("a", "b", 30)
try:
    transfer("a", "b", 500)       # CHECK fails on the 2nd UPDATE -> whole UoW rolls back
except sqlite3.IntegrityError:
    pass
print(conn.execute("SELECT * FROM acct ORDER BY id").fetchall())   # [('a', 70), ('b', 30)]`,
    related: ["repository", "saga", "command"],
    tags: ["transactions", "persistence", "atomicity"],
  },
  {
    kind: "pattern",
    id: "circuit-breaker",
    name: "Circuit Breaker",
    category: "Modern",
    intent: "Stop calling a failing dependency for a while so failures fail fast and the dependency can recover.",
    when: [
      "Remote calls (HTTP, DB, LLM APIs) that can hang or error in bursts.",
      "Prevent cascading failures and thread-pool exhaustion.",
    ],
    pitfalls: [
      "Needs thread-safety (a lock) under concurrency; half-open should admit a limited number of probes.",
      "Tune per dependency; combine with timeouts and a fallback.",
    ],
    structure: src`
          failures >= N
 +--------+ ---------------> +--------+
 | CLOSED |                  |  OPEN  |  fail fast
 +--------+ <---+            +--------+
     ^          | success        | after reset_after
     |          |                v
     |        +-------------------+
     +--------|    HALF-OPEN      |  one trial call;
   success    +-------------------+  failure -> OPEN`,
    code: src`
import time

class CircuitOpen(Exception): pass

class CircuitBreaker:
    def __init__(self, max_failures=3, reset_after=5.0, clock=time.monotonic):
        self.max_failures, self.reset_after, self.clock = max_failures, reset_after, clock
        self.failures, self.state, self.opened_at = 0, "closed", 0.0

    def call(self, fn, *args, **kwargs):
        if self.state == "open":
            if self.clock() - self.opened_at < self.reset_after:
                raise CircuitOpen("failing fast")
            self.state = "half-open"                 # allow a trial request
        try:
            result = fn(*args, **kwargs)
        except Exception:
            self.failures += 1
            if self.state == "half-open" or self.failures >= self.max_failures:
                self.state, self.opened_at = "open", self.clock()
            raise
        self.failures, self.state = 0, "closed"      # success closes the circuit
        return result

def flaky(): raise TimeoutError("upstream down")

cb = CircuitBreaker(max_failures=2, reset_after=30)
for _ in range(3):
    try:
        cb.call(flaky)
    except Exception as e:
        print(type(e).__name__)      # TimeoutError, TimeoutError, CircuitOpen`,
    related: ["retry-backoff", "proxy", "state"],
    tags: ["resilience", "distributed-systems", "fsm"],
  },
  {
    kind: "pattern",
    id: "retry-backoff",
    name: "Retry with Exponential Backoff",
    aka: ["Backoff + jitter"],
    category: "Modern",
    intent: "Retry transient failures with exponentially growing, randomised delays.",
    when: [
      "Transient errors: timeouts, 429/503, connection resets, lock contention.",
      "Only for idempotent operations (or with idempotency keys).",
    ],
    pitfalls: [
      "Retrying non-transient errors (400, auth) wastes time - whitelist exceptions.",
      "No jitter => synchronized 'thundering herd'. Cap total time; honour Retry-After.",
      "Retries at every layer multiply (3 x 3 x 3 = 27 calls).",
    ],
    structure: src`
attempt:   0      1       2         3
delay:   U(0,b) U(0,2b) U(0,4b)  U(0,min(cap, 8b))   ("full jitter")
         call -> fail(transient) -> sleep -> call -> ... -> success | raise`,
    code: src`
import random, time

class TransientError(Exception): pass

def retry(fn, *, attempts=5, base=0.1, cap=5.0,
          retry_on=(TransientError, TimeoutError), sleep=time.sleep):
    for attempt in range(attempts):
        try:
            return fn()
        except retry_on:
            if attempt == attempts - 1:
                raise                                   # out of attempts
            # exponential backoff with "full jitter"
            sleep(random.uniform(0, min(cap, base * 2 ** attempt)))

calls = {"n": 0}
def sometimes():
    calls["n"] += 1
    if calls["n"] < 3:
        raise TransientError("503")
    return "ok"

print(retry(sometimes, sleep=lambda s: None), "after", calls["n"], "calls")   # ok after 3 calls`,
    related: ["circuit-breaker", "saga"],
    tags: ["resilience", "distributed-systems", "idempotency"],
  },
  {
    kind: "pattern",
    id: "pub-sub",
    name: "Publish / Subscribe",
    aka: ["Pub/Sub", "Message broker"],
    category: "Modern",
    intent: "Publishers emit messages to topics; subscribers receive them via a broker, without knowing each other.",
    when: [
      "Fan-out of events to independent consumers (email, analytics, search index).",
      "Asynchronous, cross-process communication (Kafka, NATS, Redis, SNS/SQS, Google Pub/Sub).",
    ],
    pitfalls: [
      "Delivery is usually at-least-once: make consumers idempotent.",
      "Ordering only within a partition/key; schema evolution needs versioning.",
    ],
    structure: src`
+-----------+  publish(topic)  +--------+  deliver  +--------------+
| Publisher |----------------->| Broker |---------->| Subscriber A |
+-----------+                  | topics |---------->| Subscriber B |
                               +--------+           +--------------+
   (Observer, but decoupled in time & space by the broker)`,
    code: src`
import queue, threading
from collections import defaultdict
from collections.abc import Callable

class Broker:
    """Publishers and subscribers only know topic names, never each other."""
    def __init__(self):
        self.subs: dict[str, list[Callable[[dict], None]]] = defaultdict(list)
        self.q: queue.Queue = queue.Queue()
        self.worker = threading.Thread(target=self._dispatch, daemon=True)
        self.worker.start()

    def subscribe(self, topic: str, handler: Callable[[dict], None]):
        self.subs[topic].append(handler)

    def publish(self, topic: str, msg: dict):
        self.q.put((topic, msg))                  # async: publisher doesn't wait

    def _dispatch(self):
        while (item := self.q.get()) is not None:
            topic, msg = item
            for handler in self.subs.get(topic, []):
                handler(msg)
            self.q.task_done()

    def close(self):
        self.q.join()                             # drain, then stop the worker
        self.q.put(None)
        self.worker.join()

b = Broker()
b.subscribe("order.created", lambda m: print("email:", m["id"]))
b.subscribe("order.created", lambda m: print("analytics:", m["id"]))
b.publish("order.created", {"id": 7})
b.close()`,
    related: ["observer", "mediator", "event-sourcing", "cqrs", "saga"],
    tags: ["events", "messaging", "distributed-systems", "async"],
  },
  {
    kind: "pattern",
    id: "cqrs",
    name: "CQRS",
    aka: ["Command Query Responsibility Segregation"],
    category: "Modern",
    intent: "Use separate models for writes (commands) and reads (queries).",
    when: [
      "Read and write workloads differ a lot in shape or scale.",
      "Reads need denormalised projections (dashboards, search) built from write events.",
    ],
    pitfalls: [
      "Read side is usually eventually consistent - UI must tolerate stale reads.",
      "Significant complexity; most CRUD apps don't need it.",
    ],
    structure: src`
            +-----------+  validate +  +-------------+  events  +------------+
command --->| Write     |  mutate ---->| source of   |--------->| Projector  |
            | model     |              | truth       |          +------------+
            +-----------+              +-------------+                |
                                                                      v
query  ------------------------------------------------------> +------------+
                                                               | Read model |
                                                               +------------+`,
    code: src`
from dataclasses import dataclass

# ---- write side: commands validate + mutate the source of truth ----
@dataclass(frozen=True)
class AddItem:
    cart_id: str
    sku: str
    qty: int

class CartWriteModel:
    def __init__(self, on_change):
        self.carts: dict[str, dict[str, int]] = {}
        self.on_change = on_change              # e.g. publish an event
    def handle(self, cmd: AddItem) -> None:     # commands return nothing (or an id)
        if cmd.qty <= 0:
            raise ValueError("qty must be positive")
        items = self.carts.setdefault(cmd.cart_id, {})
        items[cmd.sku] = items.get(cmd.sku, 0) + cmd.qty
        self.on_change(cmd.cart_id, dict(items))

# ---- read side: denormalised view tuned for queries ----
class CartSummaryView:
    def __init__(self): self.rows: dict[str, dict] = {}
    def project(self, cart_id, items):
        self.rows[cart_id] = {"lines": len(items), "units": sum(items.values())}
    def get(self, cart_id) -> dict:             # queries never mutate
        return self.rows.get(cart_id, {"lines": 0, "units": 0})

view = CartSummaryView()
writes = CartWriteModel(on_change=view.project)
writes.handle(AddItem("c1", "pen", 2))
writes.handle(AddItem("c1", "ink", 1))
print(view.get("c1"))   # {'lines': 2, 'units': 3}`,
    related: ["event-sourcing", "command", "repository", "pub-sub"],
    tags: ["architecture", "ddd", "scalability"],
  },
  {
    kind: "pattern",
    id: "event-sourcing",
    name: "Event Sourcing",
    category: "Modern",
    intent: "Store state as an append-only sequence of events; current state is a fold over them.",
    when: [
      "Full audit trail / temporal queries ('what was the balance on May 1?').",
      "Rebuildable projections; natural fit with CQRS.",
    ],
    pitfalls: [
      "Events are forever: version them and write upcasters.",
      "Use optimistic concurrency (expected version) on append; snapshot long streams.",
      "GDPR deletion needs crypto-shredding or similar.",
    ],
    structure: src`
command -> Account.withdraw() -> validate -> new event
                                             |
  event store (append-only):                 v
  [Deposited(100)] [Withdrew(30)] [Withdrew(20)] ...
                    |
                    +--> replay/fold --> current state (balance = 50)
                    +--> projections --> read models`,
    code: src`
from dataclasses import dataclass

@dataclass(frozen=True)
class Deposited:
    amount: int

@dataclass(frozen=True)
class Withdrew:
    amount: int

Event = Deposited | Withdrew

class Account:
    def __init__(self, history=()):
        self.balance, self.version, self.pending = 0, 0, []
        for e in history:
            self._apply(e)                       # state = fold(events)

    def _apply(self, e: Event):
        match e:
            case Deposited(amount=a): self.balance += a
            case Withdrew(amount=a): self.balance -= a
        self.version += 1

    def withdraw(self, amount: int):             # command -> validate -> event
        if amount > self.balance:
            raise ValueError("insufficient funds")
        e = Withdrew(amount)
        self._apply(e)
        self.pending.append(e)

store: list[Event] = [Deposited(100), Withdrew(30)]   # append-only log
acct = Account(store)
acct.withdraw(20)
store.extend(acct.pending)        # real stores check expected version here
print(acct.balance, Account(store).balance)           # 50 50 (replay = same state)`,
    related: ["cqrs", "memento", "command", "pub-sub"],
    tags: ["architecture", "audit", "ddd", "events"],
  },
  {
    kind: "pattern",
    id: "saga",
    name: "Saga",
    category: "Modern",
    intent: "Run a long business transaction as a sequence of local transactions with compensating actions on failure.",
    when: [
      "A workflow spans several services/databases where 2PC is unavailable or undesirable.",
      "Orchestration (central coordinator, shown here) or choreography (services react to events).",
    ],
    pitfalls: [
      "Compensations are semantic undo (refund), not rollback; they must be idempotent and retryable.",
      "Intermediate states are visible to others - design for it.",
      "Persist saga state so a crash mid-way can resume.",
    ],
    structure: src`
reserve_stock --> charge_card --> book_courier (fails!)
                                        |
      release_stock <-- refund_card <---+   compensate in reverse order`,
    code: src`
class SagaFailed(Exception): pass

def run_saga(steps):
    """steps: list of (action, compensation). Each action is a local transaction."""
    done = []
    for action, compensate in steps:
        try:
            action()
            done.append(compensate)
        except Exception as e:
            for undo in reversed(done):      # semantic rollback, newest first
                undo()
            raise SagaFailed(f"rolled back after: {e}") from e

log = []
def reserve_stock(): log.append("stock reserved")
def release_stock(): log.append("stock released")
def charge_card():   log.append("card charged")
def refund_card():   log.append("card refunded")
def book_courier():  raise RuntimeError("no courier available")

try:
    run_saga([(reserve_stock, release_stock),
              (charge_card, refund_card),
              (book_courier, lambda: None)])
except SagaFailed as e:
    print(e)
print(log)   # ['stock reserved', 'card charged', 'card refunded', 'stock released']`,
    related: ["unit-of-work", "command", "pub-sub", "retry-backoff"],
    tags: ["distributed-systems", "transactions", "microservices"],
  },

  // ─────────────────────────────── Agent ───────────────────────────────
  {
    kind: "pattern",
    id: "react-loop",
    name: "ReAct Loop",
    aka: ["Reason + Act"],
    category: "Agent",
    intent: "Interleave model reasoning with tool actions, feeding each observation back until a final answer.",
    when: [
      "Tasks needing external information or computation the model can't do reliably alone.",
      "Exploration where the next step depends on the last result.",
    ],
    pitfalls: [
      "Always bound steps, tokens and cost; detect repeated identical actions.",
      "Validate tool names/arguments; tool output is untrusted (prompt injection).",
    ],
    structure: src`
 question -> [ LLM: Thought + Action ] --tool call--> [ Tool ]
                  ^                                      |
                  +------------- Observation ------------+
             ... until "Final Answer" or max_steps`,
    code: src`
import re

def search(q: str) -> str:
    facts = {"capital of france": "Paris", "population of paris": "about 2.1 million"}
    return facts.get(q.strip().lower(), "no result")

TOOLS = {"search": search}

def fake_llm(transcript: str) -> str:
    # stand-in for a real model call; returns a Thought + Action or a Final Answer
    if "Observation:" not in transcript:
        return "Thought: I should look this up.\nAction: search[capital of France]"
    return "Thought: The observation answers it.\nFinal Answer: Paris"

def react(question: str, llm=fake_llm, max_steps: int = 5) -> str:
    transcript = f"Question: {question}\n"
    for _ in range(max_steps):                         # always bound the loop
        out = llm(transcript)
        transcript += out + "\n"
        if m := re.search(r"Final Answer:\s*(.*)", out):
            return m.group(1)
        m = re.search(r"Action:\s*(\w+)\[(.*)\]", out)
        if not m or m.group(1) not in TOOLS:
            transcript += "Observation: invalid action, use search[...]\n"
            continue
        transcript += f"Observation: {TOOLS[m.group(1)](m.group(2))}\n"
    return "stopped: step limit reached"

print(react("What is the capital of France?"))   # Paris`,
    related: ["tool-use", "planner-executor", "reflection"],
    tags: ["llm", "agents", "loop"],
  },
  {
    kind: "pattern",
    id: "tool-use",
    name: "Tool Use / Function Calling",
    category: "Agent",
    intent: "Describe functions with JSON schemas; the model returns structured calls that your code executes.",
    when: [
      "Connect a model to APIs, databases, code execution, or retrieval.",
      "You need structured, validated arguments rather than parsing free text.",
    ],
    pitfalls: [
      "Validate arguments against the schema; never execute calls blindly (least privilege, confirmations).",
      "Return errors to the model as tool results so it can recover; cap the number of rounds.",
    ],
    structure: src`
app --(messages + tool schemas)--> model
app <--(tool_call: name, args)---- model
app: validate -> run function -> append tool result
app --(messages + result)--------> model --> final text`,
    code: src`
import json

TOOLS = [{                                     # 1) describe tools with JSON Schema
    "name": "get_weather",
    "description": "Current weather for a city",
    "input_schema": {"type": "object",
                     "properties": {"city": {"type": "string"}},
                     "required": ["city"]},
}]

def get_weather(city: str) -> dict:
    return {"city": city, "temp_c": 21}

REGISTRY = {"get_weather": get_weather}

def fake_model(messages, tools):
    # a real API returns structured tool calls; this stub mimics one round trip
    if messages[-1]["role"] == "user":
        return {"type": "tool_call", "name": "get_weather", "args": {"city": "Lubbock"}}
    data = json.loads(messages[-1]["content"])
    return {"type": "text", "text": f"It is {data['temp_c']} C in {data['city']}."}

def chat(user_msg: str, model=fake_model, max_rounds: int = 8) -> str:
    messages = [{"role": "user", "content": user_msg}]
    for _ in range(max_rounds):
        out = model(messages, TOOLS)
        if out["type"] == "text":
            return out["text"]
        fn = REGISTRY.get(out["name"])          # 2) validate + execute the call
        try:
            result = fn(**out["args"]) if fn else {"error": f"unknown tool {out['name']}"}
        except TypeError as e:
            result = {"error": str(e)}          # bad args: tell the model
        messages.append({"role": "assistant", "tool_call": out})
        messages.append({"role": "tool", "content": json.dumps(result)})   # 3) feed back
    return "stopped: too many tool rounds"

print(chat("Weather in Lubbock?"))`,
    related: ["react-loop", "router", "command"],
    tags: ["llm", "agents", "json-schema"],
  },
  {
    kind: "pattern",
    id: "planner-executor",
    name: "Planner-Executor",
    aka: ["Plan-and-Execute"],
    category: "Agent",
    intent: "One component decomposes the goal into steps; another executes them, replanning on failure.",
    when: [
      "Long, multi-step tasks where an explicit plan improves reliability and observability.",
      "Use a strong model to plan and cheaper models/tools to execute.",
    ],
    pitfalls: [
      "Plans go stale - replan with the results so far, not from scratch.",
      "Bound replans; make steps checkable (clear done criteria).",
    ],
    structure: src`
goal --> [ Planner ] --steps--> [ Executor ] --results--> context
              ^                      |
              +---- failure + done --+   (replan, bounded)`,
    code: src`
def planner(goal: str) -> list[str]:
    # a real planner is an LLM call returning a structured list of steps
    return ["fetch sales.csv", "compute monthly totals", "write summary"]

def executor(step: str, context: dict) -> str:
    # each step may itself be a ReAct / tool-use loop
    context[step] = f"done({step})"
    return context[step]

def plan_and_execute(goal: str, max_replans: int = 2) -> dict:
    context: dict[str, str] = {}
    plan = planner(goal)
    for _ in range(max_replans + 1):
        failed = None
        for step in plan:
            if step in context:
                continue                         # already done in an earlier attempt
            try:
                executor(step, context)
            except Exception as e:
                failed = (step, e)
                break
        if failed is None:
            return context
        plan = planner(f"{goal}\nfailed at {failed[0]}: {failed[1]}\ndone: {list(context)}")
    raise RuntimeError("could not complete goal")

print(plan_and_execute("Summarise last year's sales"))`,
    related: ["react-loop", "reflection", "saga", "template-method"],
    tags: ["llm", "agents", "decomposition"],
  },
  {
    kind: "pattern",
    id: "reflection",
    name: "Reflection / Critic",
    aka: ["Generator-Critic", "Self-refine"],
    category: "Agent",
    intent: "Generate a draft, critique it (ideally against grounded checks), and revise until it passes.",
    when: [
      "Code generation (run tests), structured outputs (schema validation), writing with a rubric.",
    ],
    pitfalls: [
      "Ungrounded self-critique can confirm its own mistakes - prefer tests, validators, other models.",
      "Cap rounds; keep the best-scoring draft, not just the last.",
    ],
    structure: src`
task --> [ Generator ] --draft--> [ Critic: tests / rubric ]
              ^                          |
              +------ feedback ----------+  until ok or max_rounds`,
    code: src`
def generate(task: str, feedback: str | None) -> str:
    # stand-in for an LLM that improves when given feedback
    return "def add(a, b):\n    return a + b" if feedback else "def add(a, b):\n    return a - b"

def critique(draft: str) -> tuple[bool, str]:
    # grounded critic: actually run checks instead of asking for an opinion
    ns: dict = {}
    exec(draft, ns)          # demo only: sandbox untrusted code in real systems
    ok = ns["add"](2, 3) == 5
    return ok, "" if ok else "add(2, 3) returned the wrong value; expected 5"

def reflect(task: str, max_rounds: int = 3) -> str:
    feedback, draft = None, ""
    for _ in range(max_rounds):
        draft = generate(task, feedback)
        ok, feedback = critique(draft)
        if ok:
            return draft
    return draft             # best effort after the budget is spent

print(reflect("write add(a, b)"))`,
    related: ["planner-executor", "react-loop", "template-method"],
    tags: ["llm", "agents", "evaluation"],
  },
  {
    kind: "pattern",
    id: "router",
    name: "Router",
    aka: ["Dispatcher", "Classifier-router"],
    category: "Agent",
    intent: "Classify an input and dispatch it to the specialised handler, prompt, or model best suited to it.",
    when: [
      "Mixed traffic: cheap model for easy queries, strong model or specialist agent for hard ones.",
      "Separate prompts/tools per domain (billing, tech support, search).",
    ],
    pitfalls: [
      "Always have a default route; log routing decisions to evaluate misroutes.",
      "Use cheap signals (rules, embeddings) before an LLM classifier.",
    ],
    structure: src`
                   +--> billing agent
input --> [ classify ] --> tech agent
                   +--> general (small model)   default`,
    code: src`
ROUTES = {
    "billing": lambda q: f"[billing agent] {q}",
    "tech":    lambda q: f"[tech agent] {q}",
    "general": lambda q: f"[small model] {q}",
}

def classify(query: str) -> str:
    # cheap first: keywords / embeddings; fall back to an LLM classifier when ambiguous
    q = query.lower()
    if any(w in q for w in ("refund", "invoice", "charged")):
        return "billing"
    if any(w in q for w in ("error", "crash", "stack trace")):
        return "tech"
    return "general"

def route(query: str) -> str:
    return ROUTES.get(classify(query), ROUTES["general"])(query)

print(route("I was charged twice"))
print(route("App crashes on login"))
print(route("Tell me a joke"))`,
    related: ["strategy", "chain-of-responsibility", "tool-use"],
    tags: ["llm", "agents", "dispatch"],
  },
];
