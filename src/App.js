import './App.css'
import { Breadcrumb, Layout, Menu, Image, Spin, Button, Row, Col, InputNumber, Modal, notification, Form } from 'antd';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'
import React, { useEffect, useState } from 'react'
import web3 from './web3'
import lottery from './lottery'
import { LoadingOutlined } from '@ant-design/icons';
const { Header, Content, Footer } = Layout;
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;


function App() {
  // console.log(web3.version)
  // web3.eth.getAccounts().then(console.log)

  const [manager, setManager] = useState('');
  const [result, setResult] = useState('0');
  const [winner, setWinner] = useState('0x0000000000000000000000000000000000000000')
  const [players, setPlayers] = useState([]);
  const [balance, setBalance] = useState(''); // Note: balance is not a number - it's an object (wrapped in a library called BignumberJS)
  const [value, setValue] = useState(0);
  const [message, setMessage] = useState('');
  const [msgLoading, setMsgLoading] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSentRequest, setIsSentRequest] = useState(false);

  useEffect(() => {
    const getManager = async () => {
      // Don't need to set from argument because we're using the Metamask provider

      const accounts = await web3.eth.getAccounts().then((value) => {
        setCurrentUser(value);
      });
      const result = await lottery.methods.result().call()
      const winner = await lottery.methods.winner().call()
      const manager = await lottery.methods.manager().call()
      // const players = await lottery.methods.getPlayers().call()
      const balance = await web3.eth.getBalance(lottery.options.address)
      setResult(result);
      setWinner(winner);
      setManager(manager)
      // setPlayers(players)
      setBalance(balance)
    }

    getManager()
  }, [manager, players, balance])



  const onSubmit = async (event) => {
    // event.preventDefault()
    setIsLoading(true);
    setMsgLoading('Waiting on transaction success...');

    // Need to define from argument when using send method
    const accounts = await web3.eth.getAccounts()

    try {
      await lottery.methods.payTicket().send({
        from: accounts[0],
        value: web3.utils.toWei(value, 'wei'),
      })
      setIsLoading(false);
      notification.open({
        message: 'Notification',
        description: 'Pay successfully!',
        className: 'custom-class',
        style: {
          width: 400,
        },
      });
      // setMessage('You have been entered!');
    } catch (error) {
      setIsLoading(false);
      notification.open({
        message: 'Notification',
        description: 'Something went wrong',
        className: 'custom-class',
        style: {
          width: 400,
        },
      });
    }
  }

  const onClick = async () => {
    const accounts = await web3.eth.getAccounts()

    setIsLoading(true);
    setMsgLoading('Picking a random number...');

    try {
      await lottery.methods.requestRandomWords().send({
        from: accounts[0],
      })
      setIsSentRequest(true);
      setIsLoading(false);
      notification.open({
        message: 'Notification',
        description: 'A number has been picked!',
        className: 'custom-class',
        style: {
          width: 400,
        },
      });
    } catch (error) {
      setIsLoading(false);
      notification.open({
        message: 'Notification',
        description: 'Something went wrong',
        className: 'custom-class',
        style: {
          width: 400,
        },
      });
    }
  }

  const onClickTransfer = async () => {
    const accounts = await web3.eth.getAccounts()

    setIsLoading(true);
    setMsgLoading('Transer award to winner...');

    try {
      await lottery.methods.chooseWiner().send({
        from: accounts[0],
      })
      setIsLoading(false);
      setIsModalOpen(true);
      // notification.open({
      //   message: 'Notification',
      //   description: 'Transfered award to winner!',
      //   className: 'custom-class',
      //   style: {
      //     width: 400,
      //   },
      // });
    } catch (error) {
      setIsLoading(false);
      notification.open({
        message: 'Notification',
        description: 'Something went wrong',
        className: 'custom-class',
        style: {
          width: 400,
        },
      });
    }
  }

  const bigSize = {
    fontSize: '50px'
  }

  const dad = {
    display: 'flex',
    justifyContent: 'space-between'
  }

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };


  return (
    <Spin tip={msgLoading} indicator={antIcon} spinning={isLoading}>
      <Modal title="Congratulation" open={isModalOpen} onOk={handleOk}
        footer={[
          <Button key="back" onClick={handleCancel}>
            OK
          </Button>,
        ]}>
        <p>{winner}</p>
      </Modal>
      <Layout className="layout">
        <Header>
          <div className="header-text">
            Hi {currentUser}</div>
        </Header>
        <Content
          style={{
            padding: '0 50px',
          }}
        >
          <Breadcrumb
            style={{
              margin: '16px 0',
            }}
          >
            <Breadcrumb.Item><h2>Lottery</h2></Breadcrumb.Item>
            {/* <Breadcrumb.Item>List</Breadcrumb.Item>
          <Breadcrumb.Item>App</Breadcrumb.Item> */}
          </Breadcrumb>
          <div className="site-layout-content">
            <div>
              <Row style={dad}>
                <div>
                  <p>
                    This contract is managed by {manager}.
                  </p>
                  {result !== '0' ?
                    <p>Random number: {result}</p> : <></>
                  }
                  {/* {winner !== '0x0000000000000000000000000000000000000000' ?
                    <p>Winner: {winner}</p> : <></>
                  }                 */}
                </div>
                <div>
                  <Row align='center'>
                    <Button size='large' disabled={(web3.utils.fromWei(balance, 'ether') === '0' && result === '0') || isSentRequest == true} onClick={onClick} type='primary'>Pick a random number</Button>
                    <Button size='large' style={{ marginLeft: '5px' }} disabled={result === '0'} onClick={onClickTransfer} type='primary'>Transfer award</Button>
                  </Row>
                </div>
              </Row>

              <Row align='center'>
                <h1 style={bigSize}>Total award: {web3.utils.fromWei(balance, 'ether')} ETH</h1>
              </Row>

              <Row align='center'>
                <Form onFinish={onSubmit}>
                  <div>
                    <label>Enter Wei: </label>
                    <input value={value} onChange={(e) => setValue(e.target.value)} />
                    {/* <InputNumber defaultValue={0} onChange={(e) => setValue(e)}/> */}
                    {/* <label style={{marginLeft : '5px'}}> = {value * 0.01} ETH </label> */}
                  </div>
                  <Button style={{ marginTop: '10px', width: '200px' }} type='primary' htmlType="submit">Pay</Button>
                </Form>
              </Row>

            </div>
            {/* <h1>{message}</h1> */}
          </div>
        </Content>
        <Footer
          style={{
            textAlign: 'center',
          }}
        >

        </Footer>
      </Layout>
    </Spin>

  );
}
export default App
