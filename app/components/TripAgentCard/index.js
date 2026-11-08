import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  Dimensions
} from 'react-native';
import TouchableOpacity from '@components/PressableScale';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FeatIcon from 'react-native-vector-icons/Feather';

const {width} = Dimensions.get('window');

const ParticipantsList = ({participants}) => {
  console.log('participants', participants);
  const MAX_VISIBLE_PARTICIPANTS = 3;
  const visibleParticipants = participants?.slice(0, MAX_VISIBLE_PARTICIPANTS);
  const remainingCount = participants?.length - MAX_VISIBLE_PARTICIPANTS;

  return (
    <View style={styles.participantsContainer}>
      <TouchableOpacity style={styles.addButton}>
        <Icon name="plus" size={16} color="#666" />
      </TouchableOpacity>

      {visibleParticipants?.map((participant, index) => (
        <Image
          key={index}
          source={{uri: participant.image}}
          style={[styles.participantImage, {marginLeft: index > 0 ? -12 : 0}]}
        />
      ))}

      {remainingCount > 0 && (
        <View
          style={[
            styles.participantImage,
            styles.remainingCount,
            {marginLeft: -12},
          ]}>
          <Text style={styles.remainingCountText}>+{remainingCount}</Text>
        </View>
      )}
    </View>
  );
};

const TripCard = ({trip}) => (
  <View style={styles.card}>
    <Image
      source={{uri: trip.thumbnail_image}}
      style={styles.thumbnail}
      resizeMode="cover"
    />

    <View style={styles.contentContainer}>
      <View style={styles.contentContainer2}>
        <Text numberOfLines={1} style={styles.tripTitle2}>
          {trip.title}
        </Text>
        <TouchableOpacity style={styles.iconContainer}>
          <FeatIcon name="info" size={15} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoRow}>
        <Icon name="calendar-blank-outline" size={15} color="#666" />
        <Text style={styles.infoText} numberOfLines={1}>
          {trip.check_in_date} - {trip.check_out_date}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Icon name="map-marker-outline" size={15} color="#666" />
        <Text style={styles.infoText}>{trip.destination}</Text>
      </View>

      <View style={styles.bottomRow}>
        <ParticipantsList participants={trip.joined_agents} />
        <View style={styles.progressCircle}>
          <Text style={styles.progressText}>{`${trip.joined_percentage || 100}`}</Text>
        </View>
      </View>
    </View>
  </View>
);

const TripList = ({trips, index}) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={trips}
        horizontal
        renderItem={({item}) => {
          console.log('item', item);
          return (
            <View style={{marginRight: trips.length - 1 === index ? 0 : 20}}>
              <TripCard trip={item} />
            </View>
          );
        }}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  viewAllText: {
    color: '#6200ee',
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    flexDirection: 'row',
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    width: width * 0.9, // Max width set for better layout
    maxWidth: 310, // Ensuring cards do not exceed a limit
  },
  thumbnail: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  contentContainer2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1, // Allow content to take full space
    marginBottom: 8,
  },
  tripTitle2: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1, // Ensures it takes available space
    flexWrap: 'nowrap', // Prevents excessive wrapping
    numberOfLines: 1, // Truncate if too long
  },
  iconContainer: {
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 1,
  },
  infoText: {
    marginLeft: 8,
    marginTop: 0,
    color: '#666',
    fontSize: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  participantImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'white',
  },
  remainingCount: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  remainingCountText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  progressCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e8f8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    color: '#2ecc71',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default TripList;
