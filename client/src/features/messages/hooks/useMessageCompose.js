import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { sendMessage as sendMessageThunk } from '../store/messageThunks'; // Renamed import to avoid naming conflict

/**
 * Custom hook to handle the logic of sending a message.
 */
export const useMessageCompose = () => {
  const dispatch = useDispatch();
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Function to dispatch the sendMessage thunk
  const sendMessage = useCallback(async (messageData) => {
    setIsSending(true);
    setSendError(null);
    setSendSuccess(false);

    try {
      // The thunk automatically includes senderId based on getState in createAsyncThunk
      const resultAction = await dispatch(sendMessageThunk(messageData));
      // Use unwrap to handle potential rejection and get the payload or throw error
      const result = resultAction.unwrap ? await resultAction.unwrap() : resultAction.payload;
      
      setSendSuccess(true);
      setIsSending(false);
      return result; // Return the result payload on success
    } catch (err) {
      console.error('useMessageCompose: Error sending message:', err);
      // Set a user-friendly error message
      const errorMessage = err?.message || err?.error || 'Failed to send message. Please try again.';
      setSendError(errorMessage); 
      setIsSending(false);
      throw err; // Re-throw the error so the calling component can be aware
    }
  }, [dispatch]);

  // Function to manually reset the success state (e.g., after showing a temporary message)
  const resetSuccessState = useCallback(() => {
    setSendSuccess(false);
  }, []);

  return {
    isSending,
    sendError,
    sendSuccess,
    sendMessage,
    resetSuccessState,
  };
};
