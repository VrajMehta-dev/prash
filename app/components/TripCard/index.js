import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon1 from 'react-native-vector-icons/MaterialIcons';

const TripCard = ({title, imageUri, dateRange, location, status, desc}) => {
  return (
    <View style={styles.card}>
      <View
        style={[
          styles.statusBadge,
          status === 'Completed' ? styles.completed : styles.inProgress,
        ]}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
      <Image source={{uri: imageUri}} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.details}>
          <Icon name="calendar" size={16} color="#555" />
          <Text style={styles.text}>{dateRange}</Text>
        </View>
        <View style={styles.details}>
          <Icon name="map-marker" size={16} color="#555" />
          <Text style={styles.text}>{location}</Text>
        </View>
        <View style={[styles.details, {width: 180}]}>
          <Icon1 name="info" size={16} color="#555" />
          <Text numberOfLines={1} style={styles.text}>
            {desc}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    // marginLeft: 10,
    // marginVertical: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  text: {
    marginLeft: 5,
    fontSize: 14,
    color: '#555',
  },
  statusBadge: {
    position: 'absolute',
    zIndex: 11,
    top: 10,
    left: -10, // Move to the left above the image
    backgroundColor: '#D4EDDA',

    width: 80,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    transform: [{rotate: '-30deg'}], // Slight left rotation
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // For Android shadow
    borderWidth: 1,
    borderColor: '#A3D8A0',
  },
  completed: {
    backgroundColor: '#D4EDDA',
  },
  inProgress: {
    backgroundColor: '#FFF3CD',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
  },
});

export default TripCard;
