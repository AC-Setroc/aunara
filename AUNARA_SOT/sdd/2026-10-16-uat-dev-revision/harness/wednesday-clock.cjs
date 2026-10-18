const NativeDate = Date;
const fixed = NativeDate.parse("2026-10-14T12:00:00.000Z");
globalThis.Date = new Proxy(NativeDate, {
  construct(target, args, newTarget) { return Reflect.construct(target, args.length ? args : [fixed], newTarget); },
  apply() { return new NativeDate(fixed).toString(); },
  get(target, key) { return key === "now" ? () => fixed : Reflect.get(target, key); },
});
