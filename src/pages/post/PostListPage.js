// screens/PostListPage.js
import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import Config from 'react-native-config';
import SafeTopWrapper from '../../components/SafeTopWrapper';
import { AuthContext } from '../../contexts/AuthContext';

// 간단한 게시글 아이템 컴포넌트
const PostItem = ({ post, onPress }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
        <Text style={styles.itemTitle}>{post.title}</Text>
        <Text style={styles.itemSnippet} numberOfLines={2}>
            {post.content}
        </Text>
        <Text style={styles.itemDate}>
            {new Date(post.createdAt).toLocaleDateString()}
        </Text>
    </TouchableOpacity>
);

export default function PostListPage({ navigation, route }) {
    const { token } = useContext(AuthContext);
    const apiUrl = Config.API_URL;

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cursor, setCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    // 초기 로드
    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            const params = {};
            if (cursor) params.cursor = cursor;

            const res = await axios.get(`${apiUrl}/api/posts`, {
                headers: { Authorization: `Bearer ${token}` },
                params,
            });

            if (res.data.result === 'success') {
                const newList = res.data.posts;
                setPosts(prev => [...prev, ...newList]);
                setCursor(res.data.nextCursor);
                if (!res.data.nextCursor || newList.length === 0) {
                    setHasMore(false);
                }
            }
        } catch (err) {
            console.error('fetchPosts error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        if (!loading && hasMore && cursor) {
            fetchPosts();
        }
    };

    return (
        <SafeTopWrapper style={styles.container}>
            <FlatList
                data={posts}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <PostItem
                        post={item}
                        onPress={() =>
                            navigation.navigate('PostDetail', { postId: item.id })
                        }
                    />
                )}
                contentContainerStyle={styles.listContent}
                ListFooterComponent={
                    loading && (
                        <ActivityIndicator
                            size="large"
                            color="#6495ED"
                            style={styles.loadingSpinner}
                        />
                    )
                }
                ListEmptyComponent={() =>
                    !loading && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>게시글이 없습니다.</Text>
                        </View>
                    )
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.2}
            />
        </SafeTopWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    listContent: {
        padding: 12,
    },
    itemContainer: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    itemTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 6,
        color: '#333',
    },
    itemSnippet: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    itemDate: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
    },
    loadingSpinner: {
        marginVertical: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#555',
    },
});
