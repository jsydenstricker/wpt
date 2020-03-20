function createViewWithBuffer(type, length) {
  if (type === "ArrayBuffer") {
    return new Uint8Array(new ArrayBuffer(length));
  } else {
    // See https://github.com/whatwg/html/issues/5380 for why not `new SharedArrayBuffer()`
    // WebAssembly.Memory's size is in multiples of 64 KiB
    const buffer = new WebAssembly.Memory({ shared:true, initial:1, maximum:1 }).buffer;
    return new Uint8Array(buffer, 0, length);
  }
}

["ArrayBuffer", "SharedArrayBuffer"].forEach(arrayBufferOrSharedArrayBuffer => {
  test(() => {
    const view = createViewWithBuffer(arrayBufferOrSharedArrayBuffer, 2);
    const buf = view.buffer;
    const view2 = createViewWithBuffer(arrayBufferOrSharedArrayBuffer, 2);
    const buf2 = view2.buffer;
    const decoder = new TextDecoder("utf-8");
    view[0] = 0xEF;
    view[1] = 0xBB;
    view2[0] = 0xBF;
    view2[1] = 0x40;
    assert_equals(decoder.decode(buf, {stream:true}), "");
    view[0] = 0x01;
    view[1] = 0x02;
    assert_equals(decoder.decode(buf2), "@");
  }, "Modify buffer after passing it in (" + arrayBufferOrSharedArrayBuffer  + ")");
});
