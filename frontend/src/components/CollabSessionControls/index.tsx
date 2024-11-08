import { Button, Stack } from "@mui/material";
import Stopwatch from "../Stopwatch";
import { useCollab } from "../../contexts/CollabContext";
import {
  COLLAB_ENDED_MESSAGE,
  COLLAB_PARTNER_DISCONNECTED_MESSAGE,
  USE_COLLAB_ERROR_MESSAGE,
  USE_MATCH_ERROR_MESSAGE,
} from "../../utils/constants";
import { useEffect, useReducer, useRef, useState } from "react";
import CustomDialog from "../CustomDialog";
import {
  extractMinutesFromTime,
  extractSecondsFromTime,
} from "../../utils/sessionTime";
import { CollabEvents, collabSocket } from "../../utils/collabSocket";
import { toast } from "react-toastify";
import reducer, {
  getQuestionById,
  initialState,
} from "../../reducers/questionReducer";
import { useMatch } from "../../contexts/MatchContext";

const CollabSessionControls: React.FC = () => {
  const match = useMatch();
  if (!match) {
    throw new Error(USE_MATCH_ERROR_MESSAGE);
  }

  const { questionId } = match;

  const collab = useCollab();
  if (!collab) {
    throw new Error(USE_COLLAB_ERROR_MESSAGE);
  }

  const {
    handleSubmitSessionClick,
    handleEndSessionClick,
    handleConfirmEndSession,
    isEndSessionModalOpen,
    handleRejectEndSession,
    handleExitSession,
    isExitSessionModalOpen,
    qnHistoryId,
  } = collab;

  const [time, setTime] = useState<number>(0);
  const [stopTime, setStopTime] = useState<boolean>(true);
  const timeRef = useRef<number>(time);

  const [state, dispatch] = useReducer(reducer, initialState);
  const { selectedQuestion } = state;

  useEffect(() => {
    collabSocket.once(CollabEvents.END_SESSION, (sessionDuration: number) => {
      collabSocket.off(CollabEvents.PARTNER_DISCONNECTED);
      toast.info(COLLAB_ENDED_MESSAGE);
      handleConfirmEndSession(
        timeRef.current,
        setTime,
        setStopTime,
        true,
        sessionDuration
      );
    });

    collabSocket.once(CollabEvents.PARTNER_DISCONNECTED, () => {
      collabSocket.off(CollabEvents.END_SESSION);
      toast.error(COLLAB_PARTNER_DISCONNECTED_MESSAGE);
      handleConfirmEndSession(timeRef.current, setTime, setStopTime, true);
    });

    return () => {
      collabSocket.off(CollabEvents.END_SESSION);
      collabSocket.off(CollabEvents.PARTNER_DISCONNECTED);
    };
  }, []);

  useEffect(() => {
    timeRef.current = time;

    if (stopTime) {
      return;
    }

    const intervalId = setInterval(
      () => setTime((prevTime) => prevTime + 1),
      1000
    );

    return () => clearInterval(intervalId);
  }, [time, stopTime]);

  useEffect(() => {
    if (qnHistoryId) {
      setStopTime(false);
    }
  }, [qnHistoryId]);

  useEffect(() => {
    if (!questionId) {
      return;
    }
    getQuestionById(questionId, dispatch);
  }, [questionId]);

  return (
    <Stack direction={"row"} alignItems={"center"} spacing={2}>
      <Stopwatch time={time} />
      <Button
        sx={{
          border: 1.5,
          borderRadius: 4,
        }}
        variant="outlined"
        color="success"
        onClick={() => handleSubmitSessionClick(timeRef.current)}
        disabled={stopTime}
      >
        Submit
      </Button>
      <Button
        sx={{
          border: 1.5,
          borderRadius: 4,
        }}
        variant="outlined"
        color="error"
        onClick={() => {
          handleEndSessionClick();
        }}
        disabled={stopTime}
      >
        End Session
      </Button>
      <CustomDialog
        titleText="End Session?"
        bodyText={
          <>
            Are you sure you want to end the collaboration session?
            <br />
            You will not be able to rejoin.
          </>
        }
        primaryAction="Confirm"
        handlePrimaryAction={() =>
          handleConfirmEndSession(timeRef.current, setTime, setStopTime, false)
        }
        secondaryAction="Cancel"
        open={isEndSessionModalOpen}
        handleClose={handleRejectEndSession}
      />
      <CustomDialog
        titleText={
          selectedQuestion
            ? `Question attempted: ${selectedQuestion.title}!`
            : `Question attempted!`
        }
        bodyText={`Session duration: ${extractMinutesFromTime(time)} min
          ${extractSecondsFromTime(time)} sec`}
        primaryAction="Exit session"
        handlePrimaryAction={handleExitSession}
        open={isExitSessionModalOpen}
      />
    </Stack>
  );
};

export default CollabSessionControls;
