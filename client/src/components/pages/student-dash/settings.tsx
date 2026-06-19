import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Typography,
  Switch,
  Button,
  Select,
  Option,
} from "@material-tailwind/react";
import { BellIcon, MoonIcon, GlobeAltIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

const Settings: React.FC = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [profilePublic, setProfilePublic] = useState(true);
  const [activityStatus, setActivityStatus] = useState(true);
  const [language, setLanguage] = useState("english");
  const [timezone, setTimezone] = useState("pst");

  // Handle Dark Mode toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleReset = () => {
    setEmailNotifications(true);
    setPushNotifications(false);
    setDarkMode(false);
    setProfilePublic(true);
    setActivityStatus(true);
    setLanguage("english");
    setTimezone("pst");
    toast.info("Settings reset to default", {
      position: toast.POSITION.BOTTOM_RIGHT,
    });
  };

  const handleSave = () => {
    // Simulate saving to backend/localStorage
    const settings = {
      emailNotifications,
      pushNotifications,
      darkMode,
      profilePublic,
      activityStatus,
      language,
      timezone
    };
    localStorage.setItem("studentSettings", JSON.stringify(settings));
    
    toast.success("Changes saved successfully!", {
      position: toast.POSITION.BOTTOM_RIGHT,
    });
  };

  const handleUpdateRegional = () => {
    toast.success(`Regional settings updated for ${timezone.toUpperCase()}!`, {
      position: toast.POSITION.BOTTOM_RIGHT,
    });
  };

  return (
    <div className="p-4 md:p-8 space-y-6 transition-colors duration-300 dark:bg-gray-900 dark:text-white min-h-screen">
      <div className="flex flex-col gap-2">
        <Typography variant="h3" color={darkMode ? "white" : "blue-gray"} className="font-bold">
          Settings
        </Typography>
        <Typography variant="paragraph" color={darkMode ? "gray" : "gray"}>
          Manage your account preferences and notification settings.
        </Typography>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications Section */}
        <Card className={`shadow-sm border transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <BellIcon className="h-6 w-6" />
              </div>
              <Typography variant="h5" color={darkMode ? "white" : "blue-gray"}>
                Notifications
              </Typography>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h6" color={darkMode ? "white" : "blue-gray"}>
                    Email Notifications
                  </Typography>
                  <Typography variant="small" color="gray">
                    Receive updates about your courses via email.
                  </Typography>
                </div>
                <Switch 
                  id="email-notif" 
                  ripple={false}
                  checked={emailNotifications} 
                  onChange={() => setEmailNotifications(!emailNotifications)} 
                  color="blue"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h6" color={darkMode ? "white" : "blue-gray"}>
                    Push Notifications
                  </Typography>
                  <Typography variant="small" color="gray">
                    Get real-time alerts in your browser.
                  </Typography>
                </div>
                <Switch 
                  id="push-notif" 
                  ripple={false}
                  checked={pushNotifications} 
                  onChange={() => setPushNotifications(!pushNotifications)} 
                  color="blue"
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Appearance Section */}
        <Card className={`shadow-sm border transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                <MoonIcon className="h-6 w-6" />
              </div>
              <Typography variant="h5" color={darkMode ? "white" : "blue-gray"}>
                Appearance
              </Typography>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h6" color={darkMode ? "white" : "blue-gray"}>
                    Dark Mode
                  </Typography>
                  <Typography variant="small" color="gray">
                    Switch between light and dark themes.
                  </Typography>
                </div>
                <Switch 
                  id="dark-mode" 
                  ripple={false}
                  checked={darkMode} 
                  onChange={() => setDarkMode(!darkMode)} 
                  color="purple"
                />
              </div>
              <div className="space-y-2">
                <Typography variant="h6" color={darkMode ? "white" : "blue-gray"}>
                  Language
                </Typography>
                <Select 
                  label="Select Language" 
                  value={language}
                  onChange={(v) => setLanguage(v || "english")}
                  className={darkMode ? "text-white" : ""}
                >
                  <Option value="english">English (US)</Option>
                  <Option value="spanish">Español</Option>
                  <Option value="french">Français</Option>
                  <Option value="hindi">हिन्दी</Option>
                </Select>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Account & Privacy */}
        <Card className={`shadow-sm border transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                <ShieldCheckIcon className="h-6 w-6" />
              </div>
              <Typography variant="h5" color={darkMode ? "white" : "blue-gray"}>
                Privacy
              </Typography>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h6" color={darkMode ? "white" : "blue-gray"}>
                    Public Profile
                  </Typography>
                  <Typography variant="small" color="gray">
                    Allow others to see your progress and badges.
                  </Typography>
                </div>
                <Switch 
                  id="public-profile" 
                  ripple={false}
                  checked={profilePublic} 
                  onChange={() => setProfilePublic(!profilePublic)} 
                  color="green"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h6" color={darkMode ? "white" : "blue-gray"}>
                    Activity Status
                  </Typography>
                  <Typography variant="small" color="gray">
                    Show when you are currently online.
                  </Typography>
                </div>
                <Switch 
                  id="activity-status" 
                  ripple={false}
                  checked={activityStatus} 
                  onChange={() => setActivityStatus(!activityStatus)}
                  color="green" 
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Region Section */}
        <Card className={`shadow-sm border transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                <GlobeAltIcon className="h-6 w-6" />
              </div>
              <Typography variant="h5" color={darkMode ? "white" : "blue-gray"}>
                Regional
              </Typography>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Typography variant="h6" color={darkMode ? "white" : "blue-gray"}>
                  Timezone
                </Typography>
                <Select 
                  label="Select Timezone" 
                  value={timezone}
                  onChange={(v) => setTimezone(v || "pst")}
                  className={darkMode ? "text-white" : ""}
                >
                  <Option value="utc">UTC (Coordinated Universal Time)</Option>
                  <Option value="est">EST (Eastern Standard Time)</Option>
                  <Option value="pst">PST (Pacific Standard Time)</Option>
                  <Option value="ist">IST (India Standard Time)</Option>
                </Select>
              </div>
              <div className="pt-4">
                <Button 
                  fullWidth 
                  variant="outlined" 
                  color={darkMode ? "white" : "blue-gray"} 
                  className="flex items-center justify-center gap-2"
                  onClick={handleUpdateRegional}
                >
                  Update Regional Settings
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className={`flex justify-end gap-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <Button variant="text" color={darkMode ? "white" : "gray"} onClick={handleReset}>
          Reset to Default
        </Button>
        <Button color="blue" className="px-10" onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default Settings;
