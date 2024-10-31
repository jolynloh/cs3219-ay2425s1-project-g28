import CodeMirror from "@uiw/react-codemirror";
import { langs } from "@uiw/codemirror-extensions-langs";
import { basicSetup } from "@uiw/codemirror-extensions-basic-setup";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { useEffect, useState } from "react";
import {
  getDocument,
  peerExtension,
  removeListeners,
} from "../../utils/collabSocket";
import Loader from "../Loader";
import { cursorExtension } from "../../utils/collabCursor";

interface CodeEditorProps {
  uid: string;
  username: string;
  isReadOnly?: boolean;
}

type CodeEditorState = {
  version: number | null;
  doc: string | null;
};

const CodeEditor: React.FC<CodeEditorProps> = (props) => {
  const { uid, username, isReadOnly = false } = props;

  const [codeEditorState, setCodeEditorState] = useState<CodeEditorState>({
    version: null,
    doc: null,
  });

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const { version, doc } = await getDocument();
        setCodeEditorState({
          version: version,
          doc: doc.toString(),
        });
      } catch (error) {
        console.error("Error fetching document: ", error);
      }
    };

    fetchDocument();

    return () => removeListeners();
  }, []);

  if (codeEditorState.version === null || codeEditorState.doc === null) {
    return <Loader />;
  }

  return (
    <CodeMirror
      height="300px"
      width="300px"
      basicSetup={false}
      id="codeEditor"
      extensions={[
        basicSetup(),
        langs.c(),
        peerExtension(codeEditorState.version, uid),
        cursorExtension(username),
        EditorView.editable.of(!isReadOnly),
        EditorState.readOnly.of(isReadOnly),
      ]}
      value={codeEditorState.doc}
    />
  );
};

export default CodeEditor;
