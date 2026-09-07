import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts as usePoppinsFonts,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { useFonts as useInterFonts, Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import {
  useFonts as usePlayfairFonts,
  PlayfairDisplay_500Medium_Italic,
} from '@expo-google-fonts/playfair-display';
import OnboardingScreen from './screens/OnboardingScreen';
import SentenceReconstructionScreen from './screens/SentenceReconstructionScreen';
import ProgressScreen from './screens/ProgressScreen';
import CaregiverScreen from './screens/CaregiverScreen';
import NamingPracticeScreen from './screens/NamingPracticeScreen';
import BottomTabBar, { type MainScreen } from './components/BottomTabBar';

// Must run at module scope (not inside the component) or it can fire too
// late, after the splash screen has already auto-hidden.
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [screen, setScreen] = useState<MainScreen>('reconstruction');

  const [poppinsLoaded] = usePoppinsFonts({
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  const [interLoaded] = useInterFonts({ Inter_400Regular, Inter_500Medium });
  const [playfairLoaded] = usePlayfairFonts({ PlayfairDisplay_500Medium_Italic });
  const fontsLoaded = poppinsLoaded && interLoaded && playfairLoaded;

  const onLayoutRootView = useCallback(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  if (!sessionId) {
    return (
      <View style={styles.root} onLayout={onLayoutRootView}>
        <OnboardingScreen onComplete={setSessionId} />
        <StatusBar style="auto" />
      </View>
    );
  }

  let content;
  if (screen === 'progress') {
    content = <ProgressScreen sessionId={sessionId} />;
  } else if (screen === 'caregiver') {
    content = <CaregiverScreen sessionId={sessionId} />;
  } else if (screen === 'naming') {
    content = <NamingPracticeScreen sessionId={sessionId} />;
  } else {
    content = <SentenceReconstructionScreen sessionId={sessionId} />;
  }

  return (
    <View style={styles.root} onLayout={onLayoutRootView}>
      <View style={styles.screenArea}>{content}</View>
      <BottomTabBar active={screen} onChange={setScreen} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  screenArea: { flex: 1 },
});
