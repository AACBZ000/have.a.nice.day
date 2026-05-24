/**
 * Destiny Pillars — Root Application Entry Point
 *
 * Navigation structure:
 *   - Custom 4-tab bottom bar (Reading, Match, Today, Saved)
 *   - The Reading tab hosts a native stack: Splash → Home → Result
 *   - The other three tabs are "Coming Soon" placeholder screens
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import SplashScreen  from './src/screens/SplashScreen';
import HomeScreen    from './src/screens/HomeScreen';
import ResultScreen  from './src/screens/ResultScreen';
import MatchScreen   from './src/screens/MatchScreen';
import TodayScreen   from './src/screens/TodayScreen';
import SavedScreen   from './src/screens/SavedScreen';
import BottomTabBar  from './src/components/BottomTabBar';
import { COLORS }    from './src/theme';

const Stack = createNativeStackNavigator();

// The Reading tab keeps its own stack so Splash → Home → Result still works.
// The stack is always mounted; we just hide/show the whole tab area.
function ReadingStack() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} options={{ animation: 'none' }} />
      <Stack.Screen name="Home"   component={HomeScreen}   options={{ animation: 'fade' }} />
      <Stack.Screen name="Result" component={ResultScreen} options={{ animation: 'slide_from_right' }} />
    </Stack.Navigator>
  );
}

const TAB_SCREENS = {
  Reading: ReadingStack,
  Match:   MatchScreen,
  Today:   TodayScreen,
  Saved:   SavedScreen,
};

// Tabs that should hide the bottom bar (full-screen sub-screens inside Reading).
// We detect this by whether the Reading stack is past Home (i.e. on Result/Splash).
// Simplest approach: always show the tab bar — it doesn't interfere with modals.

export default function App() {
  const [activeTab, setActiveTab] = useState('Reading');

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor={COLORS.background} />
        <View style={styles.root}>
          {/* Tab content area */}
          <View style={styles.content}>
            {Object.entries(TAB_SCREENS).map(([key, Screen]) => (
              <View
                key={key}
                style={[
                  StyleSheet.absoluteFill,
                  { display: activeTab === key ? 'flex' : 'none' },
                ]}
                pointerEvents={activeTab === key ? 'auto' : 'none'}
              >
                <Screen />
              </View>
            ))}
          </View>

          {/* Fixed bottom tab bar */}
          <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />
        </View>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
});
