import React, { useState, useEffect } from 'react';
import {
    Container,
    Flex,
    Card,
    CardBody,
    Box,
    Text,
    Spacer,
    Heading,
    Button,
    useColorModeValue,
    Table,
    Th,
    Td,
    Icon,
    Wrap,
    WrapItem,
    Avatar,
    Modal,
    Input,
    VStack,
    Image
  } from "@chakra-ui/react";
  import {CiMail} from 'react-icons/ci'
  import {AiOutlineBell} from 'react-icons/ai'
  import {AttachmentIcon} from '@chakra-ui/icons'
  import {RiSendPlaneFill} from 'react-icons/ri'
  import './chat.css'
  import { app } from '../../../Components/firebase/Firebase';
import { getFirestore, getDoc, doc, collection, where, query, orderBy, onSnapshot, serverTimestamp, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useLocation } from 'react-router-dom';

const Chat = () => {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [receiver, setReceiver] = useState()
  const [receiverId, setReceiverId]= useState('')
  const [sender, setSender] = useState()
  const location = useLocation()
  const {state}= location
  const {chat} = state

 
  console.log(chat)
  
  
  const db= getFirestore(app)


  const auth= getAuth(app)

  useEffect(() => {
    // Subscribe to authentication state changes
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in
        console.log(user)
        setUser(user);
        const chatDocRef = doc(db, "chats", chat.id); // Assuming "chats" is the collection for chat documents
        const messagesCollectionRef = collection(chatDocRef, "messages");
        const q = query(
          messagesCollectionRef,
          orderBy("timestamp", "asc")
        );
  
        const unsubscribeMessages = onSnapshot(q, (snapshot) => {
          const messageList = [];
          snapshot.forEach((doc) => {
            const messageData = doc.data();
            messageList.push(messageData);
          });
          setMessages(messageList);
        });
        
        // Return a cleanup function for the messages subscription
        return () => unsubscribeMessages();
      } else {
        // User is signed out
        setUser(null);
      }
    });
  
    // Clean up the authentication subscription when component unmounts
    return () => unsubscribeAuth();
  }, [auth, chat.id]);
  

  useEffect(()=>{
   setReceiverId(chat.users[1])      
  }, [chat])
  async function getUserByUserId(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnapshot = await getDoc(userRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        setReceiver(userData); // Update the receiver state
      } else {
        console.error('User not found');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }

  useEffect(() => {
    if (receiverId) {
      // Make sure receiverId is not empty before attempting to fetch user data
      getUserByUserId(receiverId);
    }
  }, [receiverId]); // Trigger the fetch when receiverId changes

  useEffect(() => {
    console.log(receiver);
  }, [receiver]);

  const sendMessage = async () => {
    try {
      if (message.trim() !== '') {
        const messageData = {
          text: message,
          senderId: user.uid,
          receiverId: receiverId,
          timestamp: serverTimestamp(),
        };

        const chatDocRef = doc(db, "chats", chat.id);
        const messagesCollectionRef = collection(chatDocRef, "messages");
        await addDoc(messagesCollectionRef, messageData);
        setMessage(''); // Clear the input field after sending
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  useEffect(()=>{
    const userId= chat.users[0]
    async function getUserByUserId(userId) {
      try {
        const userRef = doc(db, 'users', userId);
        const userSnapshot = await getDoc(userRef);
  
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setSender(userData); // Update the receiver state
          console.log(userData)
        } else {
          console.error('User not found');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    }
    getUserByUserId(userId)
   
  }, [chat])

  return (
    <Container
    maxWidth="4xl"
    // py="20px"
    minHeight="100vh"
    minWidth="78vw"
    bg={useColorModeValue("#F4F5F8", "gray.700")}
    color={useColorModeValue("gray.900", "white")}
    position={[null, null, null, null, 'absolute']}
    left={['0', '0', '0', "21%"]}
    overFlow-X={'hidden'}
  >
    <Flex justifyContent={'space-between'} direction="column" gap={10} position={[null, null, null, 'relative']}>
        <Card borderLeftRadius={'0px'}
        ml={'-1.2%'} mt={'2px'} >
            <CardBody>
                <Flex alignItems={'center'} justifyContent={'space-between'}>
                  <Text  fontSize={'lg'}>{receiver ? `${receiver.firstName} ${receiver.lastName}`: 'hello'}</Text>
                  <Flex gap={5} >
                    <Icon as={CiMail} boxSize={6} />
                    <Icon as={AiOutlineBell} boxSize={6} />
                    <Wrap>
                        <WrapItem>
                            <Avatar name='Dan Abrahmov' size='sm' src='https://bit.ly/dan-abramov' />
                            </WrapItem>
                    </Wrap>
                    </Flex>

                </Flex>
            </CardBody>
        </Card>

        <VStack px={10} >
            <Flex w={'65vw'} h={'70vh'} 
            direction={'column'} gap={3}
            >

              {messages.map((msg, index)=>{
                return(
                  <Flex gap={2} alignItems={'center'} direction={msg.senderId === user.uid ? 'row-reverse': 'row'} >
          <Avatar size={'sm'} name={msg.senderId === user.uid ? sender ? `${sender.firstName} ${sender.lastName}` : '' : receiver ?  `${receiver.firstName} ${receiver.lastName}` : ''} 
          src={msg.senderId === user.uid ? sender ? sender.userDp: '': receiver ? receiver.userDp: ''}  alt='user-dp'/>
        <Text
          key={index}
          p={2}
          borderRadius="lg"
          className={msg.senderId === user.uid ? 'message-sent' : 'message-received'}
          w={'fit-content'}
          maxW={'25vw'}
          borderBottomRightRadius={msg.senderId === user.uid ? 'none' : 'lg'}
          borderBottomLeftRadius={msg.senderId === user.uid ? 'lg' : 'none'}
        >
          {msg.text}
        </Text>
        </Flex>
                )
              })}
         
            </Flex>

            <Card>
                <CardBody w={'60vw'} h={'20vh'}>
                    <Flex alignItems={'center'} gap={10}>
                        <Box cursor={'pointer'}><AttachmentIcon/></Box>
                        <Box>
                            <Input w={'45vw'} borderRadius={'2xl'} bg={'#EBEBEB'} type='text'
                            _placeholder={{color: '#C4C4C4'}} placeholder='Type a text'  value={message}
                            onChange={(e) => setMessage(e.target.value)} />
                        </Box>
                        <Box cursor={'pointer'}>
                            <Icon color={'#00296B'} onClick={sendMessage} as={RiSendPlaneFill} boxSize={6}/>
                        </Box>
                    </Flex>
                </CardBody>
            </Card>
        </VStack>
        </Flex>
        </Container>
  )
}

export default Chat

