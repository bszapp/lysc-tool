import FileInput from './ui/FileInput'
import JSZip from 'jszip'

function App() {
  const handleFileSelect = async (file: File) => {
    const B64_KEY = "RjW5YyB75mHc9HWlSkv13Do+ND9kseTL2Vcn/X7sTMA=";
    const keyUint8 = Uint8Array.from(atob(B64_KEY), c => c.charCodeAt(0));

    const lyscBuf = await file.arrayBuffer();
    const lyscData = new Uint8Array(lyscBuf);
    const decrypted = new Uint8Array(lyscData.length);

    for (let i = 0; i < lyscData.length; i++) {
      decrypted[i] = lyscData[i] ^ keyUint8[i % 32];
    }

    try {
      const zip = await JSZip.loadAsync(decrypted);
      const firstFile = Object.keys(zip.files)[0];
      const jsonContent = await zip.files[firstFile].async("text");
      const jsonData = JSON.parse(jsonContent);

      const formattedJson = JSON.stringify(jsonData, null, 2);
      const blob = new Blob([formattedJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${jsonData.title || 'download'}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("解析失败，请检查文件是否为加密的 lysc");
    }
  };

  return (
    <div
      className="no-print"
      style={{
        '--primary-color': '#3482ff',
        WebkitTapHighlightColor: 'transparent'
      } as React.CSSProperties}
    >
      <style>
        {`
                #app-main div::selection {
                    background: color-mix(in srgb, var(--primary-color), transparent 70%);
                }
                
                @media print {
                    .no-print {
                        display: none !important;
                    }
                }
            `}
      </style>
      <FileInput onFileSelect={handleFileSelect} />
    </div>
  )
}

export default App