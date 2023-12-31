import {
  Box,
  Flex,
  Heading,
  Text,
  Stack,
  Image,
  Button,
  useDisclosure,
  useColorMode,
  useColorModeValue,
  InputRightElement,
  InputGroup,
  Input,
  Modal,
  ModalBody,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Center,
} from "@chakra-ui/react";
import successful from "./CryptoAssets/successful.png";
import { useState } from "react";
import NotificationModal from "../../../Admin/Notifications/NotificationModal";
import { SideBarFunc } from "../SideBarFunc";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../Goback";
import { CopyIcon } from "@chakra-ui/icons";
import { useLocation } from "react-router-dom";
import { getFirestore,addDoc, collection, Timestamp, doc, getDoc, increment, updateDoc} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../../firebase/Firebase";
import { toast } from "react-toastify";


export default function SellFinalCheckout() {
  const navigate = useNavigate();
  const [accountNumber, setAccountNumber] = useState()
  const [bankName, setBankName]= useState('')
  const [accountName, setAccountName]= useState('')
  const [transactionSaved, setTransactionSaved]= useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();
  const { state } = location;
  const { coinUnit, cryptoSymbol, amount, downloadURL, transactionHash } = state;

  const db = getFirestore(app)
  const auth = getAuth()
  const user = auth.currentUser

  function getCurrentFormattedDate() {
    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, "0");
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
    const year = currentDate.getFullYear().toString();
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes().toString().padStart(2, "0");
    const amOrPm = hours >= 12 ? "pm" : "am";
    const formattedHours = (hours % 12 || 12).toString(); // Convert to 12-hour format
    const formattedDate = `${day}-${month}-${year}`;
    const formattedTime = `${formattedHours}:${minutes}${amOrPm}`;
  
    return { date: formattedDate, time: formattedTime };
  }
  const { date, time } = getCurrentFormattedDate();
  const timestamp= Timestamp.now()
 

  const createTransaction = async (e) => {

    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();
    const notifications = userData.notifications || [];
    notifications.push({
      message: `Your sell transaction of ${coinUnit}${cryptoSymbol} is processing `,
      timestamp: new Date(), // Set the timestamp in your code
    });
    // Validate the required fields before proceeding
    if (!accountNumber || !bankName || !accountName) {
      toast.error("Please fill in all the required fields.");
      return;
    }

    try {
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        coinUnit: coinUnit,
        cryptoSymbol: cryptoSymbol,
        amount: `₦${amount}`,
        transactionHash: transactionHash,
        Imageproof: downloadURL,
        details: {
          bankName: bankName,
          accountNumber: accountNumber,
          accountName: accountName,
        },
        status: 'pending',
        transactionType: 'sell',
        time: timestamp,
      });
      await updateDoc(userDocRef, {
        notifications,
        unreadNotifications: increment(1)

      });
      setTransactionSaved(true);
    } catch (error) {
      console.log(error);
    }
  };

  const goBack = () => {
    navigate(-1);
  };
  return (
    <>
      <Flex
        h={["100vh", "100vh", "100vh"]}
        maxW="2000px"
        flexDir={["column", "column", "row"]}
        overflow="auto"
        bg={useColorModeValue("gray.50", "#050223")}
        color={useColorModeValue("gray.900", "white")}
      >
        <SideBarFunc />
        <Box
          alignItems="center"
          justifyContent="center"
          mt={10}
          mx={"10vw"}
          minW={"60vw"}
          left={['0', '0', '0', "14%"]} position={[null, null, null, null, 'relative']}
        >
          <Stack>
            {" "}
            <BackButton />
            <Flex justifyContent="space-between" marginBottom={10}>
              <Box spacing={"5"}>
                {" "}
                <Heading size={{ base: "md", md: "lg" }}>
                  Sell Cryptocurrency
                </Heading>
                <br></br>
              </Box>

              <NotificationModal/>
            </Flex>
            <Box>
              <Heading size={"md"} color={useColorModeValue("#1808A3", "white")}>
                Checkout
              </Heading>
              <Text>Kindly input your bank account details below.</Text>
              <br></br>
              <Text color={"gray.500"}>Input account number below</Text>
              <Stack justifyContent={"space-between"} spacing={5}>
                <InputGroup
                  // value={copyText}
                  // onChange={handleCopyText}
                  bgColor="#fff"
                  mb={4}
                  border="none"
                  borderColor="#fff"
                  borderRadius="10px"
                  mr={2}
                  width={"40em"}
                >
                  <InputRightElement
                    as={"button"}
                    // onClick={copyToClipboard}
                    pointerEvents="auto"
                    children={<CopyIcon color="gray" />}
                    borderRightRadius="lg"
                    placeholder="copy"
                  />
                  <Input
                    type="number"
                    placeholder="#0.00"
                    borderRadius="10px"
                    color={'black'}
                    onChange={(e)=>setAccountNumber(e.target.value)}
                    value={accountNumber}
                  />
                </InputGroup>

                <Text color={"gray.500"}>Bank Name</Text>
                <InputGroup
                  // value={copyText}
                  // onChange={handleCopyText}
                  bgColor="#fff"
                  mb={4}
                  border="none"
                  borderColor="#fff"
                  borderRadius="10px"
                  mr={2}
                  width={"40em"}
                >
                  <InputRightElement
                    as={"button"}
                    // onClick={copyToClipboard}
                    pointerEvents="auto"
                    children={<CopyIcon color="gray" />}
                    borderRightRadius="lg"
                    placeholder="copy"
                  />
                  <Input
                    type="text"
                    placeholder="Wema bank"
                    color={'black'}
                    borderRadius="10px"
                    onChange={(e)=>setBankName(e.target.value)}
                    value={bankName}
                  />
                </InputGroup>

                <Text color={"gray.500"}>Account Name</Text>
                <InputGroup
                  // value={copyText}
                  // onChange={handleCopyText}
                  bgColor="#fff"
                  mb={4}
                  border="none"
                  borderColor="#fff"
                  borderRadius="10px"
                  mr={2}
                  width={"40em"}
                >
                  <InputRightElement
                    as={"button"}
                    // onClick={copyToClipboard}
                    pointerEvents="auto"
                    children={<CopyIcon color="gray" />}
                    borderRightRadius="lg"
                    placeholder="copy"
                  />
                  <Input
                    type="test"
                    placeholder="John Doe"
                    borderRadius="10px"
                    color={'black'}
                    onChange={(e)=>setAccountName(e.target.value)}
                    value={accountName}

                  />
                </InputGroup>
              </Stack>
              <Button
        onClick={()=>{onOpen(); createTransaction()}}
        width={"240px"}
        color="#fff"
        bg= {useColorModeValue("#1808A3", "#0B0449")}
        _hover={{
          bg: "#3626c7",
        }}
        rounded={"2xl"}
      >
        Continue
      </Button>

      {transactionSaved &&<Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent p={5}>
          <ModalHeader alignSelf={"center"}></ModalHeader>
          {/* <ModalCloseButton bg={"#1808A3"} color={"#fff"} rounded={"full"} /> */}
          <ModalBody>
            <Stack>
              <Box alignSelf={"center"} mb={10}>
                {" "}
                <Heading size={"md"} align={"center"} mx={10} mb={5}>
                  Transanction completed
                </Heading>
                <Center>
                  <Image p={5} src={successful} boxSize="150px" />
                </Center>
              </Box>

              <Button
                p={5}
                height={"34px"}
                color="#fff"
                bg="#1808A3"
                _hover={{
                  bg: "#3626c7",
                }}
                rounded={"full"}
                onClick={()=> navigate('/crypto')}
              >
                OK
              </Button>
            </Stack>
          </ModalBody>
          <ModalFooter>
            {/* <Button onClick={onClose}>Close</Button> */}
          </ModalFooter>
        </ModalContent>
      </Modal>}

            </Box>
          </Stack>
        </Box>
      </Flex>
    </>
  );
}
