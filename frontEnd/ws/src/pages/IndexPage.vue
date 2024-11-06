<template>
  <q-page class="row items-center justify-evenly">
    <div style="width: 50%; border-radius: 20px;" class="bg-indigo-1 q-pa-md">
      <q-input rounded outlined v-if="!isJoined" v-model="name" type="text" placeholder="Enter your name">
        <template v-slot:append>
          <q-btn color="grey" rounded icon="login" label="Join" @click="joinChat" />
        </template>
      </q-input>

      <div v-if="isJoined" class="column" style="height: 70vh;">
        <div class="text-h6 text-center text-bold">
          You joined the chat as {{ name }}
        </div>
        <div class="col-8">
          <div class="row">
            <div v-for="message in messages" :key="message.name" class="col-12">
              <div v-if="message.isSys" class="row justify-center text-weight-bold">
                <span class="q-pr-sm">{{ message.message }}</span>
              </div>
              <div v-else class="q-py-sm">
                <div v-if="name == message.name" class="row justify-end">
                  <span class="q-pr-sm">{{ message.message }}</span>
                  <q-avatar color="grey" text-color="white" size="sm"> 
                    {{ (message.name).charAt(0).toLocaleUpperCase()}}
                    </q-avatar>
                </div>
                <div v-else class="row justify-start">
                  <q-avatar color="grey-8" text-color="white" size="sm"> {{ (message.name ||
                    'U').charAt(0).toLocaleUpperCase()
                    }}</q-avatar>
                  <span class="q-pl-sm">{{ message.message }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      <q-input v-if="isJoined" rounded outlined v-model="messageContent" placeholder="Mensaje">
        <template v-slot:append>
          <q-btn @keyup.enter="sendMessage" @click="sendMessage" round dense flat icon="send" />
        </template>
      </q-input>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, unref } from 'vue';
import { socket } from 'boot/socket';

interface Message {
  name?: string,
  message: string,
  id?: string,
  isSys: boolean
}

export default defineComponent({
  name: 'IndexPage',
  setup() {
    const isJoined = ref(false);
    const messageContent = ref('')
    const name = ref('');
    const messages = ref<Message[]>([]);


    const joinChat = () => {
      let userName = unref(name);

      if (userName) {
        socket.auth = { userName };
        socket.connect();

        isJoined.value = true;
      }
    };

    // user join and leave events
    socket.on('user-joined', (message: string) => {
      messages.value.push({
        message: message,
        isSys: true,
      });
    });

    socket.on('user-left', (message: string) => {
      let msg: Message = {
        message: message,
        isSys: true,
      }
      messages.value.push(msg);
    });

    socket.on('recieve-message', (message: Message) => {
      messages.value.push(message);
    });

    const sendMessage = () => {
      if (messageContent.value != '') {
        let message = {
          name: name.value,
          message: messageContent.value,
          id: socket.id,
          isSys: false,
        };
        socket.emit('send-message', message);
        messages.value.push(message);
        messageContent.value = '';
      }
    };

    const handleEvent = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        sendMessage()
      }
    }


    onMounted(() => {
      document.addEventListener('keydown', handleEvent)
    });

    return {
      messages,
      messageContent,
      joinChat,
      isJoined,
      name,
      sendMessage

    };
  }
});
</script>
