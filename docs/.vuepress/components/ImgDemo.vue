<template>
  <div>
    <p>
      <span class="label">Image URL:</span>
      <input type="url" v-model="imageUrl" style="width: 500px" />
    </p>

    <table style="width: 1400px">
      <tr>
        <td>format/<br />quality</td>
        <td v-for="format of formats">{{ format }}</td>
      </tr>
      <tr v-for="quality of qualities">
        <td>{{ quality }}</td>
        <td v-for="format of formats" class="cell">
          <img
            width="300"
            height="300"
            :src="`https://backend-lib-demo.appspot.com/img/?quality=${quality}&format=${format}&width=300&height=300&sourceImageUrl=${imageUrl}`"
            :alt="format + '_' + quality"
          />
        </td>
      </tr>
    </table>
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      imageUrl: 'https://www.datocms-assets.com/21281/1618925429-user-reviews.jpg',
      formats: ['jpeg', 'png', 'webp', 'avif'],
      // qualities: _range(10, 110, 10)
      qualities: [10, 50, 60, 70, 80, 90, 100],
    }
  },

  async mounted() {},

  methods: {},
}
</script>

<style>
.label {
  display: inline-block;
  width: 160px;
}

input {
  width: 200px;
}

table td {
  border: 0;
}

.cell {
  line-height: 0;
  padding: 0;
}
</style>
