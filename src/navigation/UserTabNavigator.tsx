import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Briefcase, FileText, BookOpen, Newspaper, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, layout } from '../lib/theme';
import { useLanguage } from '../contexts/LanguageContext';

import IDCardScreen from '../screens/IDCardScreen';
import JobsScreen from '../screens/JobsScreen';
import AppliedJobsScreen from '../screens/AppliedJobsScreen';
import LearnScreen from '../screens/LearnScreen';
import NewsScreen from '../screens/NewsScreen';

const Tab = createBottomTabNavigator();

export default function UserTabNavigator() {
    const insets = useSafeAreaInsets();
    const { t } = useLanguage();

    return (
        <Tab.Navigator
            backBehavior="firstRoute"
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    height: layout.tabBarHeight + insets.bottom,
                    paddingTop: 6,
                    paddingBottom: 6 + insets.bottom,
                    backgroundColor: colors.background,
                    borderTopColor: colors.border,
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOpacity: 0.05,
                    shadowRadius: 5,
                    shadowOffset: { width: 0, height: -2 },
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.muted,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginTop: 2,
                },
            }}
        >
            <Tab.Screen
                name="IDCard"
                component={IDCardScreen}
                options={{
                    tabBarLabel: t('idCard'),
                    tabBarIcon: ({ color, size }) => (
                        <User size={24} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                name="Jobs"
                component={JobsScreen}
                options={{
                    tabBarLabel: t('jobs'),
                    tabBarIcon: ({ color, size }) => (
                        <Briefcase size={24} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                name="Applied"
                component={AppliedJobsScreen}
                options={{
                    tabBarLabel: t('tabAppliedShort'),
                    tabBarIcon: ({ color, size }) => (
                        <FileText size={24} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                name="Learn"
                component={LearnScreen}
                options={{
                    tabBarLabel: t('learn'),
                    tabBarIcon: ({ color, size }) => (
                        <BookOpen size={24} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                name="News"
                component={NewsScreen}
                options={{
                    tabBarLabel: t('news'),
                    tabBarIcon: ({ color, size }) => (
                        <Newspaper size={24} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
