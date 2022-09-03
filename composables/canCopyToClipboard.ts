const { isSupported } = useClipboard();
const clipboardWirtePermission = usePermission('clipboard-write');

const canCopyToClipboard = computed(
  () => isSupported.value && clipboardWirtePermission.value === 'granted'
);

export const useCanCopyToClipboard = () => ({
  isSupported,
  clipboardWirtePermission,
  canCopyToClipboard
});
