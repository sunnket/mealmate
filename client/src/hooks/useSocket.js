// No-op socket hook — no backend in demo mode
import { useRef } from 'react';

export default function useSocket(_events = {}) {
  return useRef(null);
}
