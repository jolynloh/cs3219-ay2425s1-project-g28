import CodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { langs } from "@uiw/codemirror-extensions-langs";
import { basicSetup } from "@uiw/codemirror-extensions-basic-setup";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { indentUnit } from "@codemirror/language";
import { useEffect, useState } from "react";
import { cursorExtension } from "../../utils/collabCursor";
import { yCollab } from "y-codemirror.next";
import { Doc, Text } from "yjs";
import { Awareness } from "y-protocols/awareness";
import { useCollab } from "../../contexts/CollabContext";
import {
  COLLAB_DOCUMENT_INIT_ERROR,
  USE_COLLAB_ERROR_MESSAGE,
  USE_MATCH_ERROR_MESSAGE,
} from "../../utils/constants";
import { useMatch } from "../../contexts/MatchContext";
import { toast } from "react-toastify";

interface CodeEditorProps {
  editorState?: { doc: Doc; text: Text; awareness: Awareness };
  uid?: string;
  username?: string;
  language: string;
  template?: string;
  roomId?: string;
  isReadOnly?: boolean;
}

const languageSupport = {
  Python: langs.python(),
  Java: langs.java(),
  C: langs.c(),
};

const CodeEditor: React.FC<CodeEditorProps> = (props) => {
  const {
    editorState,
    uid = "",
    username = "",
    language,
    template = "",
    roomId = "",
    isReadOnly = false,
  } = props;

  const match = useMatch();
  if (!match) {
    throw new Error(USE_MATCH_ERROR_MESSAGE);
  }

  const { partner, questionTitle } = match;

  const collab = useCollab();
  if (!collab) {
    throw new Error(USE_COLLAB_ERROR_MESSAGE);
  }

  const {
    collabUser,
    qnId,
    initDocument,
    checkDocReady,
    sendCursorUpdate,
    receiveCursorUpdate,
  } = collab;

  const [isEditorReady, setIsEditorReady] = useState<boolean>(false);
  const [isDocumentLoaded, setIsDocumentLoaded] = useState<boolean>(false);

  const onEditorReady = (editor: ReactCodeMirrorRef) => {
    if (!isEditorReady && editor?.editor && editor?.state && editor?.view) {
      setIsEditorReady(true);
    }
  };

  useEffect(() => {
    if (isReadOnly || !isEditorReady || !editorState) {
      return;
    }

    const loadTemplate = async () => {
      if (collabUser && partner && qnId && questionTitle) {
        checkDocReady(roomId, editorState.doc, setIsDocumentLoaded);
        try {
          await initDocument(
            uid,
            roomId,
            template,
            collabUser.id,
            partner.id,
            language,
            qnId,
            questionTitle
          );
          setIsDocumentLoaded(true);
        } catch {
          toast.error(COLLAB_DOCUMENT_INIT_ERROR);
        }
      } else {
        toast.error(COLLAB_DOCUMENT_INIT_ERROR);
      }
    };
    loadTemplate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReadOnly, isEditorReady, editorState]);

  return (
    <CodeMirror
      ref={onEditorReady}
      style={{ height: "100%", width: "100%", fontSize: "14px" }}
      height="100%"
      width="100%"
      basicSetup={false}
      id="codeEditor"
      extensions={[
        indentUnit.of("\t"),
        basicSetup(),
        languageSupport[language as keyof typeof languageSupport],
        ...(!isReadOnly && editorState
          ? [
              yCollab(editorState.text, editorState.awareness),
              cursorExtension(
                roomId,
                uid,
                username,
                sendCursorUpdate,
                receiveCursorUpdate
              ),
            ]
          : []),
        EditorView.lineWrapping,
        EditorView.editable.of(!isReadOnly && isDocumentLoaded),
        EditorState.readOnly.of(isReadOnly || !isDocumentLoaded),
      ]}
      value={isReadOnly ? template : undefined}
      placeholder={
        !isReadOnly && !isDocumentLoaded ? "Loading the code..." : undefined
      }
    />
  );
};

export default CodeEditor;
