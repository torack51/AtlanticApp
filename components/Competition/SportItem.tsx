import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import ColoredImage from '../ColoredImage';
import { useRouter } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');
const ANIMATION_DURATION = 100; // milliseconds for fade animation

// Your custom colors
const color1 = '#1A3149'; // You're not using this one yet, but it's defined
const color2 = '#67A3C6'; // Blue
const color3 = '#ECC250'; // Yellow

const images = {
    'basketball': require('../../assets/images/sports/basketball-cropped.png'),
    'football': require('../../assets/images/sports/football-cropped.png'),
    'handball': require('../../assets/images/sports/handball-cropped.png'),
    'volleyball': require('../../assets/images/sports/volleyball-cropped.png'),
    'rugby': require('../../assets/images/sports/rugby-cropped.png'),
    'badminton' : require('../../assets/images/sports/badminton-cropped.png'),
    'relay' : require('../../assets/images/sports/relais-cropped.png'),
    'ultimate' : require('../../assets/images/sports/ultimate-cropped.png'),
    'tableTennis' : require('../../assets/images/sports/ultimate-cropped.png'),
    'climbing' : require('../../assets/images/sports/escalade-cropped.png'),
}

type Sport = {
    id: string;
    title: string;
    image: string; // Not used in current rendering, but defined in type
    categories: { [key: string]: { id: string; name: string; description: string; } }; // Adjusted for dictionary
};

// Assuming Props is defined elsewhere or not strictly needed for this animation
type Props = {}; // Placeholder if you need to define it

const SportItem: React.FC<{ item: Sport; index: number}> = ({ item, index }) => {
    const router = useRouter();
    const [showCategorySelection, setShowCategorySelection] = useState(false);
    const timeoutRef = useRef(null);

    // Animation values for fading in/out the two states
    const defaultSportOpacity = useRef(new Animated.Value(1)).current;
    const categorySelectionOpacity = useRef(new Animated.Value(0)).current;

    const categoriesArray = item.categories ? Object.keys(item.categories).map(key => ({
        ...item.categories[key],
        id: key
    })) : [];
    const hasTwoCategories = categoriesArray.length === 2;

    // Use your custom colors for the category buttons based on index
    const color = index % 2 === 0 ? color2 : color3;
    const oppositeColor = index % 2 === 0 ? color3 : color2;
    const leftCategoryColor = index % 2 === 0 ? color2 : color3;
    const rightCategoryColor = index % 2 === 0 ? color3 : color2;

    const sport = item.id.split('_')[0];


    // Function to navigate to the sport detail page
    const navigateToSportDetail = useCallback((categoryId = null, categoryName = null) => {
        // Clear any active timeout when navigating
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        // Fade out the current view immediately before navigating
        if (showCategorySelection) {
            Animated.timing(categorySelectionOpacity, {
                toValue: 0,
                duration: ANIMATION_DURATION / 2, // Quicker fade out
                easing: Easing.ease,
                useNativeDriver: true,
            }).start(() => {
                setShowCategorySelection(false); // Reset state after fade out
                categorySelectionOpacity.setValue(0); // Reset for next time
                // Perform navigation after the fade-out is complete
                let url = `/competition/sportDetail/${item.id}`;
                if (item.title) {
                    url += `?name=${encodeURIComponent(item.title)}`;
                }
                if (categoryId) {
                    url += `&categoryId=${encodeURIComponent(categoryId)}`;
                    url += `&categoryName=${encodeURIComponent(categoryName)}`;
                }
                router.navigate(url);
            });
        } else {
            // If it's a single category and no selection state, navigate directly
            let url = `/competition/sportDetail/${item.id}`;
            if (item.title) {
                url += `?name=${encodeURIComponent(item.title)}`;
            }
            if (categoryId) { // This might be null for single-category items
                url += `&categoryId=${encodeURIComponent(categoryId)}`;
                url += `&categoryName=${encodeURIComponent(categoryName)}`;
            }
            router.navigate(url); // Uncomment this line in your actual app
        }
    }, [item.id, item.title, showCategorySelection, categorySelectionOpacity]);

    // Effect to manage the timeout and animations
    useEffect(() => {
        let animationSequence; // To hold the animation sequence

        if (showCategorySelection) {
            // State is changing to show categories (from default)
            animationSequence = Animated.sequence([
                Animated.timing(defaultSportOpacity, {
                    toValue: 0, // Fade out default sport item
                    duration: ANIMATION_DURATION,
                    easing: Easing.ease,
                    useNativeDriver: true,
                }),
                Animated.timing(categorySelectionOpacity, {
                    toValue: 1, // Fade in category selection
                    duration: ANIMATION_DURATION,
                    easing: Easing.ease,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                defaultSportOpacity.setValue(0); // Ensure default is fully hidden after its animation
            });

            // Set a timeout to revert if no selection is made
            timeoutRef.current = setTimeout(() => {
                // State is changing back to default (from categories)
                Animated.sequence([
                    Animated.timing(categorySelectionOpacity, {
                        toValue: 0, // Fade out category selection
                        duration: ANIMATION_DURATION,
                        easing: Easing.ease,
                        useNativeDriver: true,
                    }),
                    Animated.timing(defaultSportOpacity, {
                        toValue: 1, // Fade in default sport item
                        duration: ANIMATION_DURATION,
                        easing: Easing.ease,
                        useNativeDriver: true,
                    }),
                ]).start(() => {
                    setShowCategorySelection(false);
                    timeoutRef.current = null;
                    // Reset opacity values for the next interaction cycle
                    categorySelectionOpacity.setValue(0);
                    defaultSportOpacity.setValue(1);
                });
            }, 2000); // 2 seconds

            // Cleanup function for when the component unmounts or state changes
            return () => {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
                if (animationSequence) {
                    animationSequence.stop(); // Stop any ongoing animation
                }
                // Ensure opacities are reset if component unmounts or effect re-runs mid-animation
                defaultSportOpacity.setValue(1);
                categorySelectionOpacity.setValue(0);
                setShowCategorySelection(false); // Reset internal state
            };
        } else {
            // This part handles the initial render or when returning to default non-animated state
            // Ensures default is visible and category selection is hidden
            Animated.timing(defaultSportOpacity, {
                toValue: 1,
                duration: ANIMATION_DURATION,
                easing: Easing.ease,
                useNativeDriver: true,
            }).start(() => defaultSportOpacity.setValue(1)); // Make sure it's set to 1 after animation
            categorySelectionOpacity.setValue(0); // Ensure hidden
        }
    }, [showCategorySelection, defaultSportOpacity, categorySelectionOpacity]);

    // Handle the initial press on the sport item
    const handleSportPress = () => {
        if (!hasTwoCategories) {
            // If only one category, navigate directly
            navigateToSportDetail(categoriesArray[0]?.id, categoriesArray[0]?.description); // Pass the ID of the single category if applicable
        } else {
            setShowCategorySelection(true);
        }
    };

    // Render the default sport item
    const renderDefaultSport = () => (
        <TouchableOpacity
            style={[{ backgroundColor : color } ,styles.sportItemContent]} // Apply base style for content
            onPress={handleSportPress}
            activeOpacity={0.7}
        >
            <ColoredImage imageSource={images[sport]} style={styles.image} containerStyle={{height: '100%', width: '100%', position:'absolute'}} color={index % 2 === 0 ? color2 : color2} brightness={2}/>
            <Text style={styles.sportTitle}>{item.title}</Text>
        </TouchableOpacity>
    );

    // Render the two-category selection
    const renderCategorySelection = () => (
        <View style={styles.categorySelectionContent}> {/* Apply base style for content */}
            {categoriesArray.map((category, idx) => ( // Changed index to idx to avoid conflict with outer index prop
                <TouchableOpacity
                    key={category.id} // Use category.id for key if available, fallback to idx
                    style={[
                        styles.categoryButton,
                        idx === 0 ? { backgroundColor: leftCategoryColor, borderRightWidth: 1, borderColor: '#fff' } : { backgroundColor: rightCategoryColor }
                    ]}
                    onPress={() => navigateToSportDetail(category.id, category.description)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.categoryButtonText}>{category.description}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <View style={[{ flexDirection : (index % 2 === 0 ? 'row' : 'row-reverse') }, styles.outerContainer]}>
            <View style={{ width:'70%' }}>
            <Animated.View
                style={[
                    styles.animatedWrapper,
                    { opacity: defaultSportOpacity, zIndex: showCategorySelection ? 0 : 1 },
                    styles.sportItemShadow // Apply shadow/elevation here
                ]}
            >
                {renderDefaultSport()}
            </Animated.View>

            {hasTwoCategories && ( // Only render if there are two categories to avoid unnecessary layout
                <Animated.View
                    style={[
                        styles.animatedWrapper,
                        { opacity: categorySelectionOpacity, zIndex: showCategorySelection ? 1 : 0 },
                        styles.sportItemShadow // Apply shadow/elevation here
                    ]}
                >
                    {renderCategorySelection()}
                </Animated.View>
            )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        height: 120, // Adjust based on your content's actual height
        width:'100%',
        marginVertical: 8,
        alignSelf: 'center', // Important for FlatList items
        position: 'relative', // Needed for absolute positioning of children
    },
    animatedWrapper: {
        position: 'absolute', // Stack views on top of each other
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        // The individual content components (sportItemContent, categorySelectionContent) will handle borderRadius
        // and background color directly. Shadow/elevation can be applied here or to inner content.
    },
    sportItemShadow: {
        elevation: 3, // For Android shadow
        shadowColor: '#000', // For iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    // Styles for the actual content of the default sport item
    sportItemContent: {
        flex: 1, // Make it fill the animatedWrapper,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
        overflow: 'hidden', // Ensures borderRadius is respected if content overflows
    },
    sportTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    // Styles for the actual content of the category selection
    categorySelectionContent: {
        borderRadius: 30,
        flex: 1, // Make it fill the animatedWrapper
        flexDirection: 'row',
        overflow: 'hidden', // Ensures borderRadius clips children
    },
    categoryButton: {
        flex: 1, // Each button takes half the width
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    image: {
        height: '100%',
        width:'100%',
        overflow: 'hidden',
        opacity: 0.3,
    },
});

export default SportItem;