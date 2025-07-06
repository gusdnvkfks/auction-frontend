import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import Config from 'react-native-config';
import SafeTopWrapper from '../../components/SafeTopWrapper';
import AngleHeader from '../../components/AngleHeader';

// 아이콘
import LeftAngle from '../../assets/images/common/left-angle.svg';

export default function PrivacyPolicyScreen({ navigation }) {
    const apiUrl = Config.API_URL;
    const scrollViewRef = useRef(null);
    const [sections, setSections] = useState([]);
    const [positions, setPositions] = useState({});
    const [loading, setLoading] = useState(true);

    // (예시) 소개 문구
    const introText = `가치(이하 "회사" 라고 합니다)는 정보주체의 자유와 권리 보호를 위해 「개인정보 보호법」
및 관계 법령이 정한 바를 준수하여, 적법하게 개인정보를 처리하고 안전하게
관리하고 있습니다. 이에 「개인정보 보호법」 제30조에 따라 정보주체에게
개인정보의 처리와 보호에 관한 절차 및 기준을 안내하고, 이와 관련한 고충을
신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을
수립・공개합니다.\n\n※ 이 방침에서 앱은 '가치'의 모바일 어플리케이션 "가치매김"을 뜻합니다.`;

    useEffect(() => {
        (async () => {
            try {
                const res = await axios.get(`${apiUrl}/api/terms/privacy`);
                if (res.data.result === 'success') {
                    setSections(res.data.data);
                }
            } catch (err) {
                console.warn(err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // 각 섹션 y 위치 저장
    const handleSectionLayout = key => event => {
        const { y } = event.nativeEvent.layout;
        setPositions(prev => ({ ...prev, [key]: y }));
    };

    // 클릭 시 해당 위치로 스크롤
    const scrollToSection = key => {
        const y = positions[key];
        if (y != null && scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y, animated: true });
        }
    };

    if (loading) {
        return <ActivityIndicator style={styles.loader} size="large" />;
    }

    return (
        <SafeTopWrapper>
            <AngleHeader
                title="가치 개인정보 처리방침"
                IconComponent={LeftAngle}
                onPress={() => navigation.goBack()}
            />

            <ScrollView
                ref={scrollViewRef}
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
            >
                {/* ─── 소개(인트로) 영역 ─────────────────────────── */}
                <View style={styles.introContainer}>
                    <Text style={styles.introText}>
                        {introText}
                    </Text>
                </View>

                {/* ─── 목차 ─────────────────────────── */}
                <View style={styles.tocWrapper}>
                    {sections.map(sec => (
                        <TouchableOpacity
                            key={sec.id}
                            style={styles.tocItem}
                            activeOpacity={0.7}
                            onPress={() => scrollToSection(sec.id)}
                        >
                            <Text style={styles.tocText}>
                                {sec.id < 10 ? '0' : ''}{sec.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ─── 본문 ─────────────────────────── */}
                {sections.map(sec => (
                    <View
                        key={sec.id}
                        onLayout={handleSectionLayout(sec.id)}
                        style={styles.section}
                    >
                        <Text style={styles.sectionHeading}>
                            {sec.id < 10 ? '0' : ''}{sec.title}
                        </Text>
                        <Text style={styles.sectionBody}>{sec.content}</Text>
                    </View>
                ))}
            </ScrollView>
        </SafeTopWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        padding: 16,
    },

    // ─── 소개(인트로) 영역 ───────────────────────────
    introContainer: {
        marginBottom: 24,
    },
    introText: {
        fontSize: 14,
        lineHeight: 22,
        color: '#333',
    },

    // ─── 목차 ───────────────────────────
    tocWrapper: {
        marginBottom: 24,
    },
    tocItem: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
        marginBottom: 8,
    },
    tocText: {
        fontSize: 14,
        color: '#333',
    },

    // ─── 본문 ───────────────────────────
    section: {
        marginBottom: 32,
    },
    sectionHeading: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    sectionBody: {
        fontSize: 14,
        lineHeight: 22,
        color: '#555',
    },
});
