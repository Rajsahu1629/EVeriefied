import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutGrid, Briefcase, FileText, BookOpen, Newspaper, User } from 'lucide-react-native';
import { colors, spacing } from '../lib/theme';

import IDCardScreen from '../screens/IDCardScreen';
import JobsScreen from '../screens/JobsScreen';
import AppliedJobsScreen from '../screens/AppliedJobsScreen';
import LearnScreen from '../screens/LearnScreen';
import NewsScreen from '../screens/NewsScreen';

const Tab = createBottomTabNavigator();

export default function UserTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    height: 65,
                    paddingTop: 10,
                    paddingBottom: 10,
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
                    fontSize: 10,
                    fontWeight: '600',
                    marginTop: 4,
                },
            }}
        >
            <Tab.Screen
                name="IDCard"
                component={IDCardScreen}
                options={{
                    tabBarLabel: 'ID Card',
                    tabBarIcon: ({ color, size }) => (
                        <User size={24} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                name="Jobs"
                component={JobsScreen}
                options={{
                    tabBarLabel: 'Jobs',
                    tabBarIcon: ({ color, size }) => (
                        <Briefcase size={24} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                name="Applied"
                component={AppliedJobsScreen}
                options={{
                    tabBarLabel: 'Applied',
                    tabBarIcon: ({ color, size }) => (
                        <FileText size={24} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                name="Learn"
                component={LearnScreen}
                options={{
                    tabBarLabel: 'Learn',
                    tabBarIcon: ({ color, size }) => (
                        <BookOpen size={24} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                name="News"
                component={NewsScreen}
                options={{
                    tabBarLabel: 'News',
                    tabBarIcon: ({ color, size }) => (
                        <Newspaper size={24} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
