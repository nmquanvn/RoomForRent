<template>
	<v-btn
		outlined
		:color="color"
		:class="classProp"
		@click="emitClick()"
	>	
		{{title}}
	</v-btn>
</template>

<script type="text/javascript">


export default {
		props: {
			title: {
				type: String,
			},

			icon: {
				type: String,
				default: ""
			},


			classProp: {
				type: String,
			},
			color: {
				type: String,
				default: "blue darken-1"
			},

			outlined: {
				type: Boolean,
				default: false
			},
		},
		methods: {
			emitClick(){
				this.$emit('action')
			},
		},


}
</script>