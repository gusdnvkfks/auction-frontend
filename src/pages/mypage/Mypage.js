import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import SafeTopWrapper from '../../components/SafeTopWrapper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const MyPage = () => {
    return (
        <SafeTopWrapper>
            <ScrollView style={styles.container}>
                {/* 프로필 카드 영역 */}
                <View style={styles.profileCard}>
                    <Image source={{ uri: 'https://your-cdn.com/profile.jpg' }} style={styles.profileImage} />
                    <View style={styles.profileTextContainer}>
                        <Text style={styles.nickname}>닉네임</Text>
                        <TouchableOpacity onPress={() => {}} style={styles.editProfileBtn}>
                            <Text style={styles.editProfileText}>프로필 수정</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 경매 섹션 */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>경매</Text>
                    <MenuItem label="판매내역" icon="tag-outline" onPress={() => {}} />
                    <MenuItem label="구매내역" icon="cart-outline" onPress={() => {}} />
                    <MenuItem label="찜한상품" icon="heart-outline" onPress={() => {}} />
                </View>

                {/* 내 활동 섹션 */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>내 활동</Text>
                    <MenuItem label="내가 쓴 글" icon="pencil-outline" onPress={() => {}} />
                    <MenuItem label="내가 쓴 댓글" icon="comment-text-outline" onPress={() => {}} />
                </View>

                {/* 기타 섹션 */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>기타</Text>
                    <MenuItem label="설정" icon="cog-outline" onPress={() => {}} />
                    <MenuItem label="차단 유저 목록" icon="block-helper" onPress={() => {}} />
                    <MenuItem label="공지사항" icon="bullhorn-outline" onPress={() => {}} />
                    <MenuItem label="고객센터" icon="headset" onPress={() => {}} />
                    <MenuItem label="약관 및 정책" icon="file-document-outline" onPress={() => {}} />
                </View>
            </ScrollView>
        </SafeTopWrapper>
    );
};

const MenuItem = ({ label, icon, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuItemContent}>
            <Icon name={icon} size={20} color="#6495ED" style={styles.menuIcon} />
            <Text style={styles.menuText}>{label}</Text>
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        padding: 16,
        margin: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#ddd',
    },
    profileTextContainer: {
        marginLeft: 16,
        flex: 1,
    },
    nickname: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    editProfileBtn: {
        marginTop: 6,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: '#6495ED',
        alignSelf: 'flex-start',
    },
    editProfileText: {
        color: 'white',
        fontSize: 12,
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 8,
    },
    sectionCard: {
        backgroundColor: '#f9f9f9',
        marginHorizontal: 20,
        marginTop: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    menuItem: {
        paddingVertical: 16,
    },
    menuText: {
        fontSize: 14,
        color: '#333',
    },
    menuItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIcon: {
        marginRight: 12,
    },
});

export default MyPage;
