import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Brand} from '@config/brand';

// A render error anywhere below unmounts the whole React tree and leaves a blank screen. Contain it:
// `silent` (overlays like the update prompt) renders nothing; otherwise show a retry screen.
export default class ErrorBoundary extends React.Component {
  state = {failed: false};

  static getDerivedStateFromError() {
    return {failed: true};
  }

  componentDidCatch(error) {
    console.warn('ErrorBoundary caught:', error?.message);
  }

  render() {
    if (!this.state.failed) {
      return this.props.children;
    }
    if (this.props.silent) {
      return null;
    }
    return (
      <View style={styles.box}>
        <Text style={styles.title}>Something went wrong</Text>
        <TouchableOpacity style={styles.btn} onPress={() => this.setState({failed: false})}>
          <Text style={styles.btnText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  box: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Brand.primary, padding: 28},
  title: {color: '#fff', fontSize: 18, fontWeight: 'bold'},
  btn: {backgroundColor: '#fff', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 28, marginTop: 20},
  btnText: {color: Brand.primary, fontSize: 16, fontWeight: 'bold'},
});
