import  React from "react";
import { ApolloClient, InMemoryCache, ApolloProvider, useSubscription, useMutation, gql  } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { Container, Row, Col, FormInput, Button } from 'shards-react';


const wsLink = new WebSocketLink({
  uri: 'ws://localhost:4000/',
  // uri: 'ws://quiet-plains-82573.herokuapp.com/',
  options: {
    reconnect: true
  }
});

const client = new ApolloClient({
  link: wsLink,
  uri: 'http://localhost:4000',
  // uri: 'https://quiet-plains-82573.herokuapp.com/',
  cache: new InMemoryCache()
});



const GET_MESSAGES = gql`
subscription {
  messages {
    content, 
    user, 
    id
  }
}
`;

const POST_MESSAGE = gql`
mutation($user: String!, $content: String!) {
  postMessage(user:$user, content: $content)
}
`;

const DELETE_MESSAGES = gql`
mutation {
  deleteMessages {
    id, 
    user, 
    content
  }
}
`;

const Messages = ({user}) => {
  const result = useSubscription(GET_MESSAGES)
  if(!result.data){
    return null;
  }
  console.log(result)
  // return JSON.stringify(result.data);
  return (
    <div style={{height: "100%", maxHeight: "80vh", flex: 10, overflowY: "scroll"}}>
      <div>
    {result.data.messages.map(({id, user: messageUser, content}) => (
      <div
      key={id}
      style={{display: "flex", justifyContent: user === messageUser ? "flex-end" : " flex-start", paddingBottom: "1em" }}
      > 
      {user !== messageUser && (
        <div
          style={{
            height: "50px", 
            width: "50px", 
            marginRight: "0.5em", 
            border: "2px solid #e5e6ea",
            borderRadius: "25px",
            textAlign: "center", 
            fontSize: "18pt", 
            paddingTop: "5px"

          }}
        >
          {messageUser.slice(0, 2).toUpperCase()}
        </div>
      )}
        <div style={{backgroundColor: user=== messageUser ? "#58bf56":"#e5e6ea", color: user=== messageUser ? "white":"black", padding: "1em", borderRadius: "1em", maxWidth: "60%"}}>
         
          <p style={{marginBottom: 0}}>{content}</p>
        </div>
      </div>
    ))}
    </div>
    </div>
  )
}

const Chat = () => {
  const [state, setstate] = React.useState({
    user: "Jack", 
    content: ''
  })
  const [postMessage] = useMutation(POST_MESSAGE);
  const [deleteMessages] = useMutation(DELETE_MESSAGES);
  const onSend = () => {
    if(state.content.length > 0){
      postMessage({
        variables: state
      })
    }
    setstate({
      ...state, 
      content: ''
    })
  }
  const deleteAll = () => {
    deleteMessages({});
  }
  return (
  <Container style={{ minHeight: "100vh", display: "flex", flexDirection: "column", padding: "1rem 2rem"}}>
    <div style={{flex: 1, display: "flex", justifyContent:"space-between"}}>

    <h2 >Chat window</h2>
    <div>

    <Button onClick={() => deleteAll()}>Delete Messages</Button>
    </div>
    </div>
    <Messages user={state.user} /> 
    <Row style={{flex: 1, marginTop: '1rem'}}>
      <Col xs={2} style={{padding: 0}}>
        <FormInput label="User" value={state.user} onChange={(evt) => setstate({
          ...state, 
          user: evt.target.value
        })}>

        </FormInput>
      </Col>
      <Col xs={6}>
        <FormInput label="Content" value={state.content} onChange={(evt) => setstate({
          ...state, 
          content: evt.target.value
        })} 
          onKeyUp={(evt) => {
            if(evt.keyCode === 13){
              onSend()
            }
          }}
        >

        </FormInput>
      </Col>
      <Col xs={4}>
      <Button onClick={() => onSend()} style={{width: "100%"}}>
        Send
      </Button>
      </Col>
    </Row>
  </Container>
  );
}

export default () => {
  return <ApolloProvider client={client}>
    <Chat />
  </ApolloProvider>
}