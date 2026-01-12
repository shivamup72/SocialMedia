// import { StyleSheet, Text, View, Modal, TouchableOpacity, Dimensions } from 'react-native';
// import React, { useState } from 'react';

// // Assuming you have these SVG components in the specified path
// // You might need to adjust the import paths based on your project structure
// import CalenderSvg from '../../assets/svg/CalenderSvg';
// import CloseSvg from '../../assets/svg/CloseSvg';
// import YesCircularIcon from '../../assets/svg/Yes_circular_Icon';

// // Get screen width for responsive modal sizing
// const { width } = Dimensions.get('window');

// const StartModal = () => {
//   // State to manage which step of the modal is currently active (1 or 2)
//   const [currentStep, setCurrentStep] = useState(1);
//   // State to control the visibility of the modal
//   const [isModalVisible, setModalVisible] = useState(true);

//   // Function to move to the next step
//   const handleNext = () => {
//     setCurrentStep(2);
//   };

//   // Function to close the modal
//   const handleClose = () => {
//     setModalVisible(false);
//   };

//   // Render nothing if the modal is not supposed to be visible
//   if (!isModalVisible) {
//     return null;
//   }

//   // Content for each step
//   const steps = {
//     1: {
//       icon: <CalenderSvg />,
//       title: 'Welcome to your calendar',
//       subtitle: 'Keep track of your tasks, expense claims and leave approvals all in one place.',
//     },
//     2: {
//       icon: <YesCircularIcon />,
//       title: 'Tracks tasks & Apply for leave',
//       subtitle: 'Complete assigned tasks and apply for leave with just a few taps.',
//     },
//   };

//   const activeStep = steps[currentStep];

//   return (
//     <Modal
//       transparent={true}
//       animationType="fade"
//       visible={isModalVisible}
//       onRequestClose={handleClose} // For Android back button
//     >
//       <View style={styles.overlay}>
//         {/* This container includes the speech bubble and the pointer */}
//         <View style={styles.modalContainer}>
//           {/* This view creates the triangle pointer using a CSS trick */}
//           <View style={styles.pointer} />

//           {/* This is the main content bubble */}
//           <View style={styles.bubble}>
//             <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
//               <CloseSvg width={14} height={14} />
//             </TouchableOpacity>

//             <View style={styles.content}>
//               <View style={styles.iconContainer}>{activeStep.icon}</View>

//               <Text style={styles.title}>{activeStep.title}</Text>

//               <Text style={styles.subtitle}>{activeStep.subtitle}</Text>

//               {/* Pagination Dots */}
//               <View style={styles.paginationContainer}>
//                 <View style={[styles.dot, currentStep === 1 ? styles.activeDot : {}]} />
//                 <View style={[styles.dot, currentStep === 2 ? styles.activeDot : {}]} />
//               </View>

//               {/* Conditional Buttons */}
//               {currentStep === 1 ? (
//                 <>
//                   <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
//                     <Text style={styles.buttonText}>Next</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity onPress={handleClose}>
//                     <Text style={styles.skipButtonText}>Skip</Text>
//                   </TouchableOpacity>
//                 </>
//               ) : (
//                 <TouchableOpacity style={styles.primaryButton} onPress={handleClose}>
//                   <Text style={styles.buttonText}>Got it</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// export default StartModal;

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.6)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   modalContainer: {
//     width: width * 0.9, // 90% of screen width
//     alignItems: 'center',
//     // Add margin at the top to make space for the pointer
//     marginTop: 20,
//   },
//   // The speech bubble pointer, created by styling and rotating a square View
//   pointer: {
//     width: 20,
//     height: 20,
//     backgroundColor: '#FFFFFF',
//     transform: [{ rotate: '45deg' }],
//     // Position it above the main bubble content
//     marginBottom: -10,
//     // Align it to match the figma design (slightly off-center)
//     marginLeft: - (width * 0.4),
//   },
//   bubble: {
//     width: '100%',
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 24,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   closeButton: {
//     position: 'absolute',
//     top: 16,
//     right: 16,
//     zIndex: 1,
//   },
//   content: {
//     alignItems: 'center',
//     width: '100%',
//   },
//   iconContainer: {
//     marginBottom: 16,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#212529',
//     textAlign: 'center',
//     marginBottom: 8,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#6C757D',
//     textAlign: 'center',
//     lineHeight: 20,
//   },
//   paginationContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginVertical: 24,
//   },
//   dot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: '#CED4DA',
//     marginHorizontal: 4,
//   },
//   activeDot: {
//     backgroundColor: '#F98146', // Active color (Orange)
//     width: 20, // Active dot is wider
//   },
//   primaryButton: {
//     backgroundColor: '#F98146',
//     paddingVertical: 14,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//     width: '100%',
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   skipButtonText: {
//     color: '#6C757D',
//     fontSize: 16,
//     fontWeight: '500',
//     marginTop: 16, // Space between primary button and skip link
//   },
// });


/////////////////
/////////////////
/////////////////



import { StyleSheet, Text, View, Modal, TouchableOpacity, Dimensions } from 'react-native';
import React, { useState } from 'react';

// Assuming you have these SVG components in the specified path
import CalenderSvg from '../../assets/svg/CalenderSvg';
import CloseSvg from '../../assets/svg/CloseSvg';
import YesCircularIcon from '../../assets/svg/Yes_circular_Icon';

const { width } = Dimensions.get('window');

const StartModal = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isModalVisible, setModalVisible] = useState(true);

  const handleNext = () => {
    setCurrentStep(2);
  };

  const handleClose = () => {
    setModalVisible(false);
  };

  if (!isModalVisible) {
    return null;
  }

  const steps = {
    1: {
      icon: <CalenderSvg />,
      title: 'Welcome to your calendar',
      subtitle: 'Keep track of your tasks, expense claims and leave approvals all in one place.',
    },
    2: {
      icon: <YesCircularIcon />,
      title: 'Tracks tasks & Apply for leave',
      subtitle: 'Complete assigned tasks and apply for leave with just a few taps.',
    },
  };

  const activeStep = steps[currentStep];

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={isModalVisible}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {/* This container positions the entire bubble component */}
        <View style={styles.modalContainer}>
          {/* This view creates the triangle pointer using the border trick */}
          <View style={styles.pointer} />

          {/* This is the main content bubble */}
          <View style={styles.bubble}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <CloseSvg width={20} height={20} />
            </TouchableOpacity>
            
            <View style={styles.content}>
              <View style={styles.iconContainer}>{activeStep.icon}</View>
              <Text style={styles.title}>{activeStep.title}</Text>
              <Text style={styles.subtitle}>{activeStep.subtitle}</Text>
              <View style={styles.paginationContainer}>
                <View style={[styles.dot, currentStep === 1 ? styles.activeDot : {}]} />
                <View style={[styles.dot, currentStep === 2 ? styles.activeDot : {}]} />
              </View>
              {currentStep === 1 ? (
                <>
                  <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
                    <Text style={styles.buttonText}>Next</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleClose}>
                    <Text style={styles.skipButtonText}>Skip</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity style={styles.primaryButton} onPress={handleClose}>
                  <Text style={styles.buttonText}>Got it</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default StartModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    // justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: width * 0.9, 
    marginTop:150,
  },
  // *** THIS IS THE CORRECTED POINTER STYLE ***
  pointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    // The side borders create the width of the triangle
    borderLeftWidth: 130,
    borderRightWidth: 0,
    // The bottom border creates the height and visible part of the triangle
    borderBottomWidth: 100,
    // Make the side borders transparent
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    // The bottom border is the color of our bubble
    borderBottomColor: '#FFFFFF',
    // Position it to the left, matching the Figma design
    alignSelf: 'flex-start',
    marginLeft: 50, // Adjust this value to get the exact horizontal position
  },
  bubble: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CED4DA',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#F98146',
    width: 20,
  },
  primaryButton: {
    backgroundColor: '#F98146',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButtonText: {
    color: '#6C757D',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
  },
});