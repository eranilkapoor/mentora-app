import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SettingsScreen from "../screens/Settings/SettingsScreen";
import ChangePasswordScreen from "../screens/Settings/ChangePasswordScreen";
import HelpSupportScreen from "../screens/Settings/HelpSupportScreen";
import NotificationSettingsScreen from "../screens/Settings/NotificationSettingsScreen";
import PrivacyPolicyScreen from "../screens/Settings/PrivacyPolicyScreen";

const Stack = createNativeStackNavigator();

export default function SettingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Back" 
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
      
      <Stack.Screen 
        name="ChangePassword" 
        component={ChangePasswordScreen}
        options={{ title: "Change Password" }} 
      />

      <Stack.Screen 
        name="HelpSupport" 
        component={HelpSupportScreen}
        options={{ title: "Help & Support" }} 
      />

      <Stack.Screen 
        name="NotificationSettings" 
        component={NotificationSettingsScreen}
        options={{ title: "Notification Settings" }} 
      />

      <Stack.Screen 
        name="PrivacyPolicy" 
        component={PrivacyPolicyScreen}
        options={{ title: "Privacy Policy" }} 
      />
    </Stack.Navigator>
  );
}
