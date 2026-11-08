import {useCallback, useState} from 'react';
import {useSelector} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';
import {apiGet} from '@utils/authedApi';

// The selected outlet's security deposit: {has_deposit, amount, status: none|pending|paid, locked, ...}.
// `locked` means bill / charge payments are paused until the deposit is paid. Refreshes on focus.
export function useSecurityDeposit() {
  const prId = useSelector(s => s.auth.shopSelected?.pr_id);
  const [state, setState] = useState({loading: true, data: null});

  const reload = useCallback(async () => {
    if (!prId) {
      setState({loading: false, data: null});
      return;
    }
    try {
      const r = await apiGet(`client/security-deposit/${prId}`);
      setState({loading: false, data: r.ok ? r.data?.data : null});
    } catch (e) {
      setState(s => ({...s, loading: false}));
    }
  }, [prId]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return {...state, reload, locked: !!state.data?.locked};
}
