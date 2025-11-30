const FILE_TYPES = [
    { description: 'Tiny Collection', accept: { 'text/plain': ['.json', '.tcoll'] } },
] as FilePickerAcceptType[];

export async function loadFile(receiver: (f: string) => void, types: FilePickerAcceptType[] = FILE_TYPES) {
    if (window.showOpenFilePicker !== undefined) {
        const pickerOpts = {
            types,
            multiple: false,
        } as OpenFilePickerOptions;
        try {
            const [handle] = await window.showOpenFilePicker(pickerOpts);
            const f = await handle.getFile();
            const data = await f.text();
            receiver(data);
        } catch (e) {
            console.log(e);
        }
    }
}

export async function saveFile(f: string, types: FilePickerAcceptType[] = FILE_TYPES) {
    // availability already checked below
    const newHandle = await window.showSaveFilePicker({ types, excludeAcceptAllOption: true });
    const stream = await newHandle.createWritable();
    await stream.write(f);
    await stream.close();
}
