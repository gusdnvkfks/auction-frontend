import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import HomePage from '../pages/main/HomePage';
// import MyPage from '../pages/main/MyPage'; // 아직 없으면 빈 컴포넌트로
// import ChatPage from '../pages/main/ChatPage';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ color, size }) => {
                let iconName = 'home';
                if (route.name === '홈') iconName = 'home';
                else if (route.name === '게시판') iconName = 'comments';
                else if (route.name === '마이페이지') iconName = 'user';

                return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#6495ED',
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tab.Screen name="홈" component={HomePage} />
            <Tab.Screen name="게시판" component={HomePage} />
            <Tab.Screen name="채팅" component={HomePage} />
            <Tab.Screen name="마이페이지" component={HomePage} />
        </Tab.Navigator>
    );
}
