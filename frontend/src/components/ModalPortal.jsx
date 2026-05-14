/**
 * ModalPortal — renderiza seus filhos direto no document.body
 * via createPortal, garantindo que position:fixed funcione corretamente
 * independente de qualquer stacking context pai (animations, transforms, etc.)
 */
import { createPortal } from 'react-dom';

export default function ModalPortal({ children }) {
  return createPortal(children, document.body);
}
