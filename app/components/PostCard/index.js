import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  Alert,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RBSheet from 'react-native-raw-bottom-sheet'; // Import RBSheet
import {FontFamily} from '@config/theme';
import {useTheme} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {getApiDataProgress} from '@utils/apiHelper';
import BaseSetting from '@config/setting';
import {useSelector} from 'react-redux';
import {translate} from '@lang/Translate';

const PostCard = ({
  post,
  currentUser,
  length,
  isCommunity = false,
  userPress = () => {},
  onLikePress = () => {},
  onCommentSend = () => {},
  onFollow = () => {},
}) => {
  const {colors} = useTheme();
  const BaseColors = colors;
  const {userData} = useSelector(state => state.auth);

  let like = post.is_like;
  let likeCount = post?.likes_count;
  // const [likes, setLikes] = useState(post?.likes_count || 0);
  // const [liked, setLiked] = useState(post?.is_like || false);
  const [comments, setComments] = useState(post?.comments || []);

  const [newComment, setNewComment] = useState('');

  const [replyComment, setReplyComment] = useState('');
  const [activeCommentIndex, setActiveCommentIndex] = useState(null);
  const bottomSheetRef = useRef();

  // Handle Like Button Press
  const handleLikePress = id => {
    if (like) {
      likeCount = likeCount - 1;
    } else {
      likeCount = likeCount + 1;
    }
    like = !like;
    onLikePress(id);
  };

  useEffect(() => {
    setIsFollowing(post?.is_following);
  }, [post?.is_following]);

  // Handle Add Comment
  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments]);
      SendComment(post?.id, newComment);
      setNewComment('');
    }
  };

  // Handle Add Reply
  const handleAddReply = index => {
    if (replyComment.trim()) {
      const updatedComments = [...comments];
      updatedComments[index].replies.push({
        user: currentUser,
        text: replyComment.trim(),
      });
      setComments(updatedComments);
      setReplyComment('');
      setActiveCommentIndex(null);
    }
  };
  const [isFollowing, setIsFollowing] = useState(post?.is_following || false);

  const handleToggle = type => {
    setIsFollowing(!isFollowing);
    onFollow(post?.user_id, type);
  };
  // Function to Send the Comments
  const SendComment = async (postId, comment) => {
    try {
      const data = {
        'TravelPostsComment[post_id]': postId,
        'TravelPostsComment[user_id]': userData?.id,
        'TravelPostsComment[comment]': comment,
      };
      const endpoint = BaseSetting.endpoints.addComment;
      const result = await getApiDataProgress(endpoint, 'POST', data);

      if (result?.status) {
        onCommentSend('background');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: result?.message,
        });
      }
    } catch (error) {
      // Handle API call error
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.message,
      });
    }
  };
  return (
    <View
      style={[
        styles.container,
        {
          minWidth: isCommunity
            ? length > 1
              ? 320
              : Dimensions.get('screen').width / 1.1
            : null,
          maxWidth: isCommunity ? 320 : 350,
          minHeight: isCommunity ? 400 : null,
          maxHeight: isCommunity ? 400 : null,
        },
      ]}>
      {/* User Info Section */}
      <View style={styles.userInfoContainer}>
        <View style={styles.userInfo}>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => {
              userPress(post?.user_id);
            }}>
            <Image
              source={{
                uri:
                  post.user_avatar ||
                  'https://i.ibb.co/chSG40V/user-image-l-3x.png',
              }}
              style={styles.avatar}
            />
          </TouchableOpacity>
          <View style={styles.nameTimeContainer}>
            <Text style={styles.username}>{post?.user_name || 'User'}</Text>
            <Text style={styles.timeAgo}>{post.timeAgo || 'new'}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            if (isCommunity) {
              handleToggle(post?.is_following);
            } else {
              Alert.alert('Reported');
            }
          }}
          style={styles.moreButton}>
          {isCommunity ? (
            <Text
              style={{
                fontFamily: FontFamily.bold,
                color: BaseColors.primary,
              }}>
              {isFollowing ? translate('unfollow') : translate('follow')}
            </Text>
          ) : (
            <Icon name="more-vert" size={20} color="#666" />
          )}
        </TouchableOpacity>
      </View>

      <View style={{position: 'relative'}}>
        {/* Post Visibility Label */}
        {post?.post_visibility && (
          <View
            style={{
              position: 'absolute',
              zIndex: 10,
              top: 10,
              left: 10,
              backgroundColor: BaseColors.white,
              paddingVertical: 5,
              paddingHorizontal: 10,
              borderRadius: 10,
              elevation: 5,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.2,
              shadowRadius: 5,
            }}>
            <Text style={{fontWeight: 'bold', color: BaseColors.red}}>
              {post.post_visibility === 'public' ? 'Public' : 'Private'}
            </Text>
          </View>
        )}

        {/* Post Image */}
        <Image
          source={{
            uri:
              post?.image ||
              'https://i.ibb.co/L11GGyL/depositphotos-89250312-stock-illustration-photo-picture-web-icon-in.webp',
          }}
          style={styles.postImage}
          resizeMode="cover"
        />
      </View>

      {/* Caption */}
      <Text numberOfLines={2} style={styles.caption}>
        {post?.description}
      </Text>

      {/* Engagement Section */}
      <View style={styles.engagementContainer}>
        {/* Like Button */}
        <TouchableOpacity
          style={styles.engagementItem}
          onPress={() => {
            handleLikePress(post?.id);
          }}>
          <Icon
            name={like ? 'favorite' : 'favorite-border'}
            size={24}
            color={like ? '#e63946' : '#666'}
          />
          <Text style={styles.engagementCount}>{likeCount}</Text>
        </TouchableOpacity>

        {/* Comment Button */}
        <TouchableOpacity
          style={styles.engagementItem}
          onPress={() => bottomSheetRef.current.open()}>
          <Icon name="chat-bubble-outline" size={24} color="#666" />
          <Text style={styles.engagementCount}>
            {post?.comments.length || 0}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet for Comment Section */}
      <RBSheet
        ref={bottomSheetRef}
        closeOnDragDown={true}
        draggable
        closeOnPressMask={true}
        height={600}
        customStyles={{
          draggableIcon: {
            backgroundColor: '#8080B3',
            width: 60,
          },
          container: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 16,
            backgroundColor: '#fff',
          },
        }}>
        <Text style={styles.commentHeader}>{translate('comments')}</Text>

        {/* Render Comments */}
        <FlatList
          inverted
          data={post?.comments}
          keyExtractor={(item, index) => index.toString() + 1}
          renderItem={({item, index}) => (
            <View
              style={[
                styles.commentItem,
                {flexDirection: item.user ? 'row' : 'row-reverse'},
              ]}>
              {/* Safely access user.avatar and fallback to default if not available */}
              <Image
                source={{
                  uri:
                    item.user?.avatar ||
                    'https://i.ibb.co/chSG40V/user-image-l-3x.png',
                }}
                style={styles.commentAvatar}
              />
              <View style={styles.commentTextContainer}>
                <View style={{flexDirection: 'row', marginBottom: 5}}>
                  <Text style={styles.commentUsername}>
                    {item.user?.name || 'Unknown User'}
                  </Text>
                  <Text style={styles.timeAgo}>
                    {'  '}
                    {item.timeAgo || 'now'}
                  </Text>
                </View>
                <Text style={styles.commentText}>{item.text}</Text>

                {/* Replies Section */}
                <FlatList
                  data={item.replies}
                  keyExtractor={(reply, replyIndex) => replyIndex.toString()}
                  renderItem={({item: reply, replyIndex}) => (
                    <View style={styles.replyContainer}>
                      <Image
                        source={{
                          uri:
                            reply.user?.avatar ||
                            'https://i.ibb.co/chSG40V/user-image-l-3x.png',
                        }}
                        style={styles.commentAvatar}
                      />
                      <Text style={styles.replyText}>
                        {reply.user?.name || 'Unknown'}: {reply.text}
                      </Text>
                    </View>
                  )}
                />

                {/* Reply Button */}
                <TouchableOpacity
                  style={styles.replyButton}
                  onPress={() => setActiveCommentIndex(index)}>
                  <Text style={styles.replyText}>Reply</Text>
                </TouchableOpacity>

                {/* Show Reply Input if Active */}
                {activeCommentIndex === index && (
                  <View style={styles.replyInputContainer}>
                    <TextInput
                      placeholder="Write a reply..."
                      value={replyComment}
                      onChangeText={setReplyComment}
                      style={styles.textInput}
                    />
                    <TouchableOpacity onPress={() => handleAddReply(index)}>
                      <Icon name="send" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}
        />

        {/* Add New Comment */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Add a comment..."
            value={newComment}
            onChangeText={setNewComment}
            style={styles.textInput}
          />
          <TouchableOpacity onPress={handleAddComment}>
            <Icon name="send" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </RBSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginVertical: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,

    shadowRadius: 4,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  nameTimeContainer: {
    justifyContent: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  timeAgo: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  postImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#f0f0f0',
  },
  caption: {
    fontSize: 14,
    color: '#000',
    padding: 12,
  },
  engagementContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  engagementCount: {
    marginLeft: 6,
    color: '#666',
    fontSize: 14,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  commentTextContainer: {
    flex: 1,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
  },
  commentHeader: {
    fontFamily: FontFamily.semiBold,
    fontSize: 18,
    marginVertical: 10,
  },
  replyContainer: {
    flexDirection: 'row',
    marginTop: 6,
  },
  replyText: {
    fontSize: 14,
    color: '#666',
  },
  replyButton: {
    marginTop: 6,
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 12,
  },
});

export default PostCard;
